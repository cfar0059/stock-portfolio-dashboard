/**
 * Portfolio API Client
 * Handles all HTTP communication with the NestJS backend
 * Uses fetch with proper error handling and typed responses
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

/**
 * Custom error class for API errors
 * Preserves HTTP status and error details
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Backend Portfolio response shape
 */
export type BackendPortfolio = {
  id: string;
  recoveryCodeHash: string;
  recoveryCodeSalt: string;
  recoveryCodeLookup: string;
  createdAt: string;
  updatedAt: string;
  positions: BackendPosition[];
};

/**
 * Backend Position response shape
 */
export type BackendPosition = {
  id: string;
  symbol: string;
  shares: string; // Decimal as string from Prisma
  buyPrice: string; // Decimal as string from Prisma
  dcaPrice: string | null; // Decimal as string or null
  portfolioId: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Position DTO for creating/updating positions
 */
export type PositionDto = {
  symbol: string;
  shares: number;
  buyPrice: number;
  dcaPrice?: number | null;
};

/**
 * Create Portfolio response
 */
export type CreatePortfolioResponse = {
  portfolioId: string;
  recoveryCode: string;
};

/**
 * Link Portfolio response
 */
export type LinkPortfolioResponse = {
  portfolioId: string;
};

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    // Parse JSON response
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      const errorMessage =
        data?.error?.message || data?.message || "API request failed";
      const errorCode = data?.error?.code;
      throw new ApiError(errorMessage, response.status, errorCode);
    }

    return data as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap network/parse errors
    const message =
      error instanceof Error ? error.message : "Unknown API error";
    throw new ApiError(message, 0);
  }
}

/**
 * Create a new portfolio
 * POST /portfolios
 */
export async function createPortfolio(): Promise<CreatePortfolioResponse> {
  return apiFetch<CreatePortfolioResponse>("/portfolios", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

/**
 * Link to existing portfolio via recovery code
 * POST /portfolios/link
 */
export async function linkPortfolio(
  recoveryCode: string,
): Promise<LinkPortfolioResponse> {
  return apiFetch<LinkPortfolioResponse>("/portfolios/link", {
    method: "POST",
    body: JSON.stringify({ recoveryCode }),
  });
}

/**
 * Get portfolio with all positions
 * GET /portfolios/:id
 */
export async function getPortfolio(
  portfolioId: string,
): Promise<BackendPortfolio> {
  return apiFetch<BackendPortfolio>(`/portfolios/${portfolioId}`, {
    method: "GET",
  });
}

/**
 * Add a new position to the portfolio
 * POST /portfolios/:id/positions
 */
export async function addPosition(
  portfolioId: string,
  dto: PositionDto,
): Promise<BackendPosition> {
  return apiFetch<BackendPosition>(`/portfolios/${portfolioId}/positions`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

/**
 * Update an existing position
 * PATCH /portfolios/:id/positions/:positionId
 */
export async function updatePosition(
  portfolioId: string,
  positionId: string,
  dto: Partial<PositionDto>,
): Promise<BackendPosition> {
  return apiFetch<BackendPosition>(
    `/portfolios/${portfolioId}/positions/${positionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(dto),
    },
  );
}

/**
 * Delete a position
 * DELETE /portfolios/:id/positions/:positionId
 */
export async function deletePosition(
  portfolioId: string,
  positionId: string,
): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>(
    `/portfolios/${portfolioId}/positions/${positionId}`,
    {
      method: "DELETE",
    },
  );
}
