import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { z } from "zod";
import { PortfolioService } from "./portfolio.service";
import { createPositionSchema, updatePositionSchema } from "./dto";

const createPortfolioSchema = z.object({}).strict();
const linkPortfolioSchema = z
  .object({
    recoveryCode: z.string(),
  })
  .strict();

@Controller("portfolios")
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  /**
   * POST /portfolios
   * Create a new portfolio
   * Returns: { portfolioId, recoveryCode }
   */
  @Post()
  async createPortfolio(@Body() body: unknown) {
    createPortfolioSchema.parse(body);
    return this.portfolioService.createPortfolio();
  }

  /**
   * POST /portfolios/link
   * Link to existing portfolio via recovery code
   * Returns: { portfolioId }
   */
  @Post("link")
  async linkPortfolio(@Body() body: unknown) {
    const { recoveryCode } = linkPortfolioSchema.parse(body);
    return this.portfolioService.linkPortfolio(recoveryCode);
  }

  /**
   * GET /portfolios/:id
   * Get portfolio with all positions
   */
  @Get(":id")
  async getPortfolio(@Param("id") id: string) {
    return this.portfolioService.getPortfolio(id);
  }

  /**
   * POST /portfolios/:id/positions
   * Add a new position to the portfolio
   * Body: { symbol, shares, buyPrice, dcaPrice? }
   */
  @Post(":id/positions")
  async createPosition(
    @Param("id") portfolioId: string,
    @Body() body: unknown,
  ) {
    const dto = createPositionSchema.parse(body);
    return this.portfolioService.createPosition(portfolioId, dto);
  }

  /**
   * PATCH /portfolios/:id/positions/:positionId
   * Update an existing position (partial updates allowed)
   * Body: { symbol?, shares?, buyPrice?, dcaPrice? }
   */
  @Patch(":id/positions/:positionId")
  async updatePosition(
    @Param("id") portfolioId: string,
    @Param("positionId") positionId: string,
    @Body() body: unknown,
  ) {
    const dto = updatePositionSchema.parse(body);
    return this.portfolioService.updatePosition(portfolioId, positionId, dto);
  }

  /**
   * DELETE /portfolios/:id/positions/:positionId
   * Delete a position from the portfolio
   */
  @Delete(":id/positions/:positionId")
  async deletePosition(
    @Param("id") portfolioId: string,
    @Param("positionId") positionId: string,
  ) {
    return this.portfolioService.deletePosition(portfolioId, positionId);
  }
}
