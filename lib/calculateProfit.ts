interface ProfitData {
    amount: number;
    percentage: number;
}
export const calculateProfit = (price: number, buyPrice: number, shares: number): ProfitData => {
    const amount = (price - buyPrice) * shares;
    const percentage = ((price / buyPrice) - 1) * 100;
    return {amount, percentage};
};

