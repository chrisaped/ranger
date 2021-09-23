const accountSize = 5900;
const riskPercentage = .005;
const risk = accountSize * riskPercentage;
export const defaultStopPriceDifference = .25;

const calculateRiskPerShare = (currentPrice, stopPrice) => {
  return currentPrice - stopPrice;
};

export const calculatProfitTarget = (currentPrice, stopPrice, side) => {
  const riskPerShare = calculateRiskPerShare(currentPrice, stopPrice);
  if (side === 'buy') {
    return (currentPrice + (riskPerShare * 1.5)).toFixed(2);
  }
  return (currentPrice - (riskPerShare * 1.5)).toFixed(2);  
};

export const calculatePositionSize = (currentPrice, stopPrice) => {
  const riskPerShare = calculateRiskPerShare(currentPrice, stopPrice);
  return Math.round(risk / riskPerShare);
};

export const calculateMoneyUpfront = (currentPrice, stopPrice) => {
  const positionSize = calculatePositionSize(currentPrice, stopPrice);
  return Math.round(currentPrice * positionSize).toLocaleString();
};

export const calculateProfitLoss = (currentPrice, entryPrice, shares, side) => {
  const purchaseValue = shares * entryPrice;
  const currentValue = shares * currentPrice;
  if (side === 'long') {
    return (currentValue - purchaseValue).toFixed(2);
  }
  return (purchaseValue - currentValue).toFixed(2);
}

export const isInProfit = (calculatedProfitLoss) => {
  const plFloat = parseFloat(calculatedProfitLoss);
  if (plFloat > 0) {
    return true;
  }
  return false;
};

export const calculateDefaultStopPrice = (side, price) => {
  let defaultStopPrice = price - defaultStopPriceDifference;
  if (side === 'sell') {
    defaultStopPrice = price + defaultStopPriceDifference;
  }
  return defaultStopPrice.toFixed(2);
}
