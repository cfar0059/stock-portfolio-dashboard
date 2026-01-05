import { BadRequestException } from "@nestjs/common";
import { PortfolioService } from "./portfolio.service";
import * as recovery from "../recovery/recovery-code";

const mockPrisma = {
  portfolio: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe("PortfolioService", () => {
  let service: PortfolioService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new PortfolioService(mockPrisma as any);
  });

  it("creates a portfolio and returns the recovery code", async () => {
    const mockCode = "AAAA-BBBB-CCCC-DDDD";
    const mockLookup = "lookup";
    const mockHash = "hash";
    const mockSalt = "salt";
    jest.spyOn(recovery, "generateRecoveryCode").mockReturnValue(mockCode);
    jest
      .spyOn(recovery, "recoveryCodeLookupKey")
      .mockReturnValue(mockLookup);
    jest
      .spyOn(recovery, "hashRecoveryCode")
      .mockReturnValue({ hash: mockHash, salt: mockSalt });
    mockPrisma.portfolio.create.mockResolvedValue({ id: "portfolio-id" });

    const result = await service.createPortfolio();

    expect(result).toEqual({
      portfolioId: "portfolio-id",
      recoveryCode: mockCode,
    });
    expect(mockPrisma.portfolio.create).toHaveBeenCalledWith({
      data: {
        recoveryCodeLookup: mockLookup,
        recoveryCodeHash: mockHash,
        recoveryCodeSalt: mockSalt,
      },
      select: { id: true },
    });
  });

  it("links a portfolio when recovery code matches", async () => {
    const mockCode = "AAAA-BBBB-CCCC-DDDD";
    const mockLookup = "lookup";
    jest
      .spyOn(recovery, "recoveryCodeLookupKey")
      .mockReturnValue(mockLookup);
    mockPrisma.portfolio.findUnique.mockResolvedValue({
      id: "portfolio-id",
      recoveryCodeHash: "hash",
      recoveryCodeSalt: "salt",
    });
    jest.spyOn(recovery, "verifyRecoveryCode").mockReturnValue(true);

    const result = await service.linkPortfolio(mockCode);

    expect(result).toEqual({ portfolioId: "portfolio-id" });
    expect(mockPrisma.portfolio.findUnique).toHaveBeenCalledWith({
      where: { recoveryCodeLookup: mockLookup },
      select: {
        id: true,
        recoveryCodeHash: true,
        recoveryCodeSalt: true,
      },
    });
  });

  it("throws when portfolio is not found for lookup", async () => {
    jest
      .spyOn(recovery, "recoveryCodeLookupKey")
      .mockReturnValue("lookup");
    mockPrisma.portfolio.findUnique.mockResolvedValue(null);

    await expect(service.linkPortfolio("code")).rejects.toThrow(
      new BadRequestException("INVALID_RECOVERY_CODE"),
    );
  });

  it("throws when verification fails", async () => {
    jest
      .spyOn(recovery, "recoveryCodeLookupKey")
      .mockReturnValue("lookup");
    mockPrisma.portfolio.findUnique.mockResolvedValue({
      id: "portfolio-id",
      recoveryCodeHash: "hash",
      recoveryCodeSalt: "salt",
    });
    jest.spyOn(recovery, "verifyRecoveryCode").mockReturnValue(false);

    await expect(service.linkPortfolio("code")).rejects.toThrow(
      new BadRequestException("INVALID_RECOVERY_CODE"),
    );
  });
});
