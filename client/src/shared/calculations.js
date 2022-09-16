import { riskPercentage, defaultStopPriceDifference } from "./constants";

const calculateRiskPerShare = (limitPrice, stopPrice) =>
  Math.abs(limitPrice - stopPrice);

export const calculateLastProfitTarget = (
  limitPrice,
  stopPrice,
  side,
  lastMultiplier
) => {
  const riskPerShare = calculateRiskPerShare(limitPrice, stopPrice);

  if (side === "buy") {
    return limitPrice + riskPerShare * lastMultiplier;
  }
  return limitPrice - riskPerShare * lastMultiplier;
};

export const calculatePositionSize = (limitPrice, stopPrice, accountSize) => {
  const risk = accountSize * riskPercentage;
  const riskPerShare = calculateRiskPerShare(limitPrice, stopPrice);
  return Math.round(risk / riskPerShare);
};

export const calculateMoneyUpfront = (limitPrice, stopPrice, accountSize) => {
  const positionSize = calculatePositionSize(
    limitPrice,
    stopPrice,
    accountSize
  );
  return limitPrice * positionSize;
};

export const calculateProfitLoss = (
  currentPrice,
  side,
  currentShares,
  initialShares,
  entryPrice,
  profitTargets
) => {
  let filledEarnings = 0.0;
  if (profitTargets?.length > 0) {
    profitTargets.forEach((profitTarget) => {
      const { filled, quantity, filled_avg_price } = profitTarget;
      if (filled) filledEarnings += quantity * filled_avg_price;
    });
  }
  const unFilledCurrentValue = currentShares * currentPrice;
  const purchaseValue = initialShares * entryPrice;
  const combinedCurrentValue = filledEarnings + unFilledCurrentValue;
  if (side === "long") {
    return combinedCurrentValue - purchaseValue;
  }
  return purchaseValue - combinedCurrentValue;
};

export const calculateDefaultStopPrice = (side, limitPrice) => {
  let defaultStopPrice = limitPrice + defaultStopPriceDifference;
  if (side === "sell") {
    defaultStopPrice = limitPrice - defaultStopPriceDifference;
  }
  return defaultStopPrice;
};

export const sumObjectValues = (obj) =>
  Object.values(obj).reduce((a, b) => a + b);
