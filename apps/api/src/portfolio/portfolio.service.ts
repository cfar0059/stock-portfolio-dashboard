import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  generateRecoveryCode,
  hashRecoveryCode,
  recoveryCodeLookupKey,
  verifyRecoveryCode,
} from "../recovery/recovery-code";

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
}
