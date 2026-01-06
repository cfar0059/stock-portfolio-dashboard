import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  generateRecoveryCode,
  hashRecoveryCode,
  recoveryCodeLookupKey,
  verifyRecoveryCode,
} from "../recovery/recovery-code";
import type { CreatePositionDto, UpdatePositionDto } from "./dto";

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async createPortfolio(): Promise<{
    portfolioId: string;
    recoveryCode: string;
  }> {
    const recoveryCode = generateRecoveryCode();
    const recoveryCodeLookup = recoveryCodeLookupKey(recoveryCode);
    const { hash: recoveryCodeHash, salt: recoveryCodeSalt } =
      hashRecoveryCode(recoveryCode);

    const portfolio = await this.prisma.portfolio.create({
      data: {
        recoveryCodeLookup,
        recoveryCodeHash,
        recoveryCodeSalt,
      },
      select: { id: true },
    });

    return {
      portfolioId: portfolio.id,
      recoveryCode,
    };
  }

  async linkPortfolio(recoveryCode: string): Promise<{ portfolioId: string }> {
    const recoveryCodeLookup = recoveryCodeLookupKey(recoveryCode);
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { recoveryCodeLookup },
      select: {
        id: true,
        recoveryCodeHash: true,
        recoveryCodeSalt: true,
      },
    });

    if (!portfolio) {
      throw new BadRequestException("INVALID_RECOVERY_CODE");
    }

    const isMatch = verifyRecoveryCode(
      recoveryCode,
      portfolio.recoveryCodeHash,
      portfolio.recoveryCodeSalt,
    );
    if (!isMatch) {
      throw new BadRequestException("INVALID_RECOVERY_CODE");
    }
    return { portfolioId: portfolio.id };
  }

  /**
   * Get portfolio with all positions
   */
  async getPortfolio(portfolioId: string) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: { positions: true },
    });

    if (!portfolio) {
      throw new NotFoundException("Portfolio not found");
    }

    return portfolio;
  }

  /**
   * Add a new position to a portfolio
   */
  async createPosition(portfolioId: string, dto: CreatePositionDto) {
    // Verify portfolio exists
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId },
      select: { id: true },
    });

    if (!portfolio) {
      throw new NotFoundException("Portfolio not found");
    }

    return this.prisma.position.create({
      data: {
        symbol: dto.symbol,
        shares: dto.shares,
        buyPrice: dto.buyPrice,
        dcaPrice: dto.dcaPrice ?? null,
        portfolioId,
      },
    });
  }

  /**
   * Update an existing position
   * Ensures the position belongs to the portfolio (prevents cross-portfolio writes)
   */
  async updatePosition(
    portfolioId: string,
    positionId: string,
    dto: UpdatePositionDto,
  ) {
    // Verify position exists and belongs to portfolio
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
      select: { portfolioId: true },
    });

    if (!position) {
      throw new NotFoundException("Position not found");
    }

    if (position.portfolioId !== portfolioId) {
      throw new BadRequestException(
        "Position does not belong to this portfolio",
      );
    }

    return this.prisma.position.update({
      where: { id: positionId },
      data: {
        ...(dto.symbol !== undefined && { symbol: dto.symbol }),
        ...(dto.shares !== undefined && { shares: dto.shares }),
        ...(dto.buyPrice !== undefined && { buyPrice: dto.buyPrice }),
        ...(dto.dcaPrice !== undefined && { dcaPrice: dto.dcaPrice ?? null }),
      },
    });
  }

  /**
   * Delete a position
   * Ensures the position belongs to the portfolio (prevents cross-portfolio deletes)
   */
  async deletePosition(portfolioId: string, positionId: string) {
    // Verify position exists and belongs to portfolio
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
      select: { portfolioId: true },
    });

    if (!position) {
      throw new NotFoundException("Position not found");
    }

    if (position.portfolioId !== portfolioId) {
      throw new BadRequestException(
        "Position does not belong to this portfolio",
      );
    }

    await this.prisma.position.delete({
      where: { id: positionId },
    });

    return { deleted: true };
  }
}
