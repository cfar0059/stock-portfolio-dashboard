import { Body, Controller, Post } from "@nestjs/common";
import { z } from "zod";
import { PortfolioService } from "./portfolio.service";

const createPortfolioSchema = z.object({}).strict();
const linkPortfolioSchema = z
  .object({
    recoveryCode: z.string(),
  })
  .strict();

@Controller("portfolios")
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  async createPortfolio(@Body() body: unknown) {
    createPortfolioSchema.parse(body);
    return this.portfolioService.createPortfolio();
  }

  @Post("link")
  async linkPortfolio(@Body() body: unknown) {
    const { recoveryCode } = linkPortfolioSchema.parse(body);
    return this.portfolioService.linkPortfolio(recoveryCode);
  }
}
