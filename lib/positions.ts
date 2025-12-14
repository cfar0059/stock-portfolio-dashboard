export type Position = {
  id: string; // uuid or simple timestamp string
  symbol: string;
  shares: number;
  buyPrice: number;
  dca?: number; // Dollar Cost Averaging target price (optional)
};
