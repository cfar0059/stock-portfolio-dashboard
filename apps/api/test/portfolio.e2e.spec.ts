import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { RequestIdMiddleware } from "../src/common/middleware/request-id.middleware";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { LoggingInterceptor } from "../src/common/interceptors/logging.interceptor";
import { PrismaService } from "../src/prisma/prisma.service";

/**
 * Portfolio + Position CRUD API integration tests
 *
 * Prerequisites:
 * - Docker Compose DB must be running: `docker compose up -d db`
 * - Database must be migrated
 */
describe("Portfolio API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    // Register middleware, filters, interceptors same as main.ts
    app.use(new RequestIdMiddleware().use.bind(new RequestIdMiddleware()));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.position.deleteMany({});
    await prisma.portfolio.deleteMany({});
  });

  describe("POST /portfolios", () => {
    it("should create a new portfolio and return portfolioId + recoveryCode", async () => {
      const response = await request(app.getHttpServer())
        .post("/portfolios")
        .send({})
        .expect(201);

      expect(response.body).toHaveProperty("portfolioId");
      expect(response.body).toHaveProperty("recoveryCode");
      expect(typeof response.body.portfolioId).toBe("string");
      expect(typeof response.body.recoveryCode).toBe("string");
      expect(response.body.portfolioId).toMatch(/^c[a-z0-9]+$/); // cuid format
    });

    it("should reject request with extra fields", async () => {
      const response = await request(app.getHttpServer())
        .post("/portfolios")
        .send({ extra: "field" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /portfolios/:id", () => {
    it("should return portfolio with positions when it exists", async () => {
      // Create a portfolio first
      const createRes = await request(app.getHttpServer())
        .post("/portfolios")
        .send({});

      const { portfolioId } = createRes.body;

      // Get the portfolio
      const response = await request(app.getHttpServer())
        .get(`/portfolios/${portfolioId}`)
        .expect(200);

      expect(response.body).toHaveProperty("id", portfolioId);
      expect(response.body).toHaveProperty("positions");
      expect(Array.isArray(response.body.positions)).toBe(true);
      expect(response.body.positions).toHaveLength(0);
    });

    it("should return 404 when portfolio does not exist", async () => {
      const response = await request(app.getHttpServer())
        .get("/portfolios/clxxxxxxxxxxxxxxxxxxxxx")
        .expect(404);

      expect(response.body.error.message).toMatch(/not found/i);
    });
  });

  describe("POST /portfolios/:id/positions", () => {
    let portfolioId: string;

    beforeEach(async () => {
      // Create a portfolio for position tests
      const createRes = await request(app.getHttpServer())
        .post("/portfolios")
        .send({});
      portfolioId = createRes.body.portfolioId;
    });

    it("should add a new position to the portfolio", async () => {
      const positionData = {
        symbol: "aapl",
        shares: 10,
        buyPrice: 150.5,
        dcaPrice: 140,
      };

      const response = await request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send(positionData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.symbol).toBe("AAPL"); // Should be uppercased
      expect(Number(response.body.shares)).toBe(10);
      expect(Number(response.body.buyPrice)).toBe(150.5);
      expect(Number(response.body.dcaPrice)).toBe(140);
      expect(response.body.portfolioId).toBe(portfolioId);
    });

    it("should add position without optional dcaPrice", async () => {
      const positionData = {
        symbol: "MSFT",
        shares: 5,
        buyPrice: 300,
      };

      const response = await request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send(positionData)
        .expect(201);

      expect(response.body.symbol).toBe("MSFT");
      expect(response.body.dcaPrice).toBeNull();
    });

    it("should reject invalid shares (zero)", async () => {
      const response = await request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send({
          symbol: "AMD",
          shares: 0,
          buyPrice: 100,
        })
        .expect(400);

      expect(response.body.error.message).toMatch(/shares/i);
    });

    it("should reject invalid shares (negative)", async () => {
      const response = await request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send({
          symbol: "AMD",
          shares: -5,
          buyPrice: 100,
        })
        .expect(400);

      expect(response.body.error.message).toMatch(/shares/i);
    });

    it("should reject invalid buyPrice (zero)", async () => {
      const response = await request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send({
          symbol: "NVDA",
          shares: 10,
          buyPrice: 0,
        })
        .expect(400);

      expect(response.body.error.message).toMatch(/buy price/i);
    });

    it("should reject invalid buyPrice (negative)", async () => {
      const response = await request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send({
          symbol: "NVDA",
          shares: 10,
          buyPrice: -100,
        })
        .expect(400);

      expect(response.body.error.message).toMatch(/buy price/i);
    });

    it("should reject missing required fields", async () => {
      const response = await request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send({
          symbol: "TSLA",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 404 when portfolio does not exist", async () => {
      const response = await request(app.getHttpServer())
        .post("/portfolios/clxxxxxxxxxxxxxxxxxxxxx/positions")
        .send({
          symbol: "GOOG",
          shares: 1,
          buyPrice: 100,
        })
        .expect(404);

      expect(response.body.error.message).toMatch(/not found/i);
    });
  });

  describe("PATCH /portfolios/:id/positions/:positionId", () => {
    let portfolioId: string;
    let positionId: string;

    beforeEach(async () => {
      // Create a portfolio and a position
      const createRes = await request(app.getHttpServer())
        .post("/portfolios")
        .send({});
      portfolioId = createRes.body.portfolioId;

      const positionRes = await request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send({
          symbol: "AAPL",
          shares: 10,
          buyPrice: 150,
          dcaPrice: 140,
        });
      positionId = positionRes.body.id;
    });

    it("should update position fields", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/portfolios/${portfolioId}/positions/${positionId}`)
        .send({
          shares: 15,
          buyPrice: 155,
        })
        .expect(200);

      expect(Number(response.body.shares)).toBe(15);
      expect(Number(response.body.buyPrice)).toBe(155);
      expect(response.body.symbol).toBe("AAPL"); // Unchanged
      expect(Number(response.body.dcaPrice)).toBe(140); // Unchanged
    });

    it("should allow updating dcaPrice to null", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/portfolios/${portfolioId}/positions/${positionId}`)
        .send({
          dcaPrice: null,
        })
        .expect(200);

      expect(response.body.dcaPrice).toBeNull();
    });

    it("should reject invalid shares in update", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/portfolios/${portfolioId}/positions/${positionId}`)
        .send({
          shares: -10,
        })
        .expect(400);

      expect(response.body.error.message).toMatch(/shares/i);
    });

    it("should return 404 when position does not exist", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/portfolios/${portfolioId}/positions/clxxxxxxxxxxxxxxxxxxxxx`)
        .send({
          shares: 20,
        })
        .expect(404);

      expect(response.body.error.message).toMatch(/not found/i);
    });

    it("should prevent cross-portfolio updates", async () => {
      // Create another portfolio
      const otherRes = await request(app.getHttpServer())
        .post("/portfolios")
        .send({});
      const otherPortfolioId = otherRes.body.portfolioId;

      // Try to update first portfolio's position via second portfolio's ID
      const response = await request(app.getHttpServer())
        .patch(`/portfolios/${otherPortfolioId}/positions/${positionId}`)
        .send({
          shares: 99,
        })
        .expect(400);

      expect(response.body.error.message).toMatch(/does not belong/i);
    });
  });

  describe("DELETE /portfolios/:id/positions/:positionId", () => {
    let portfolioId: string;
    let positionId: string;

    beforeEach(async () => {
      // Create a portfolio and a position
      const createRes = await request(app.getHttpServer())
        .post("/portfolios")
        .send({});
      portfolioId = createRes.body.portfolioId;

      const positionRes = await request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send({
          symbol: "TSLA",
          shares: 2,
          buyPrice: 700,
        });
      positionId = positionRes.body.id;
    });

    it("should delete the position", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/portfolios/${portfolioId}/positions/${positionId}`)
        .expect(200);

      expect(response.body).toEqual({ deleted: true });

      // Verify position is gone
      const getRes = await request(app.getHttpServer())
        .get(`/portfolios/${portfolioId}`)
        .expect(200);

      expect(getRes.body.positions).toHaveLength(0);
    });

    it("should return 404 when position does not exist", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/portfolios/${portfolioId}/positions/clxxxxxxxxxxxxxxxxxxxxx`)
        .expect(404);

      expect(response.body.error.message).toMatch(/not found/i);
    });

    it("should prevent cross-portfolio deletes", async () => {
      // Create another portfolio
      const otherRes = await request(app.getHttpServer())
        .post("/portfolios")
        .send({});
      const otherPortfolioId = otherRes.body.portfolioId;

      // Try to delete first portfolio's position via second portfolio's ID
      const response = await request(app.getHttpServer())
        .delete(`/portfolios/${otherPortfolioId}/positions/${positionId}`)
        .expect(400);

      expect(response.body.error.message).toMatch(/does not belong/i);
    });
  });

  describe("Full workflow: create portfolio → add position → get portfolio", () => {
    it("should complete the full workflow successfully", async () => {
      // Step 1: Create portfolio
      const createRes = await request(app.getHttpServer())
        .post("/portfolios")
        .send({})
        .expect(201);

      const { portfolioId } = createRes.body;

      // Step 2: Add position
      await request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send({
          symbol: "amd",
          shares: 25,
          buyPrice: 120.75,
          dcaPrice: 110,
        })
        .expect(201);

      // Step 3: Get portfolio and verify position is included
      const getRes = await request(app.getHttpServer())
        .get(`/portfolios/${portfolioId}`)
        .expect(200);

      expect(getRes.body.id).toBe(portfolioId);
      expect(getRes.body.positions).toHaveLength(1);
      expect(getRes.body.positions[0].symbol).toBe("AMD");
      expect(Number(getRes.body.positions[0].shares)).toBe(25);
      expect(Number(getRes.body.positions[0].buyPrice)).toBe(120.75);
      expect(Number(getRes.body.positions[0].dcaPrice)).toBe(110);
    });
  });
});

