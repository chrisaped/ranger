const accountSize = 5900;
const riskPercentage = .005;
const risk = accountSize * riskPercentage;

const calculateRiskPerShare = (currentPrice, stopPrice) => {
  return currentPrice - stopPrice;
};

export const calculatProfitTarget = (currentPrice, stopPrice) => {
  const riskPerShare = calculateRiskPerShare(currentPrice, stopPrice);
  return (currentPrice + (riskPerShare * 1.5)).toFixed(2);
};

export const calculatePositionSize = (currentPrice, stopPrice) => {
  const riskPerShare = calculateRiskPerShare(currentPrice, stopPrice);
  return Math.round(risk / riskPerShare);
};

export const calculateMoneyUpfront = (currentPrice, stopPrice) => {
  const positionSize = calculatePositionSize(currentPrice, stopPrice);
  return Math.round(currentPrice * positionSize).toLocaleString();
};

export const calculateProfitLoss = (currentPrice, entryPrice, shares) => {
  const purchaseValue = shares * entryPrice;
  const currentValue = shares * currentPrice;
  return (currentValue - purchaseValue).toFixed(2);
}
