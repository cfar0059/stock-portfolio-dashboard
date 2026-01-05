import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { RequestIdMiddleware } from "../src/common/middleware/request-id.middleware";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { LoggingInterceptor } from "../src/common/interceptors/logging.interceptor";

/**
 * Health endpoint integration tests
 *
 * Prerequisites:
 * - Docker Compose DB must be running: `docker compose up -d db`
 * - Database must be migrated
 */
describe("Health Endpoints (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Register middleware, filters, interceptors same as main.ts
    app.use(new RequestIdMiddleware().use.bind(new RequestIdMiddleware()));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /health", () => {
    it("should return 200 with { ok: true }", async () => {
      const response = await request(app.getHttpServer()).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
    });

    it("should include X-Request-Id header", async () => {
      const response = await request(app.getHttpServer()).get("/health");

      expect(response.headers["x-request-id"]).toBeDefined();
      expect(response.headers["x-request-id"]).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe("GET /health/ready", () => {
    it("should return 200 with { ok: true } when DB is available", async () => {
      const response = await request(app.getHttpServer()).get("/health/ready");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
    });

    it("should include X-Request-Id header", async () => {
      const response = await request(app.getHttpServer()).get("/health/ready");

      expect(response.headers["x-request-id"]).toBeDefined();
    });
  });
});
