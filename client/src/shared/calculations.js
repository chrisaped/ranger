import { riskPercentage, defaultStopPriceDifference } from "./constants";

const calculateRiskPerShare = (limitPriceFloat, stopPriceFloat) =>
  Math.abs(limitPriceFloat - stopPriceFloat);

export const calculateLastProfitTarget = (
  limitPrice,
  stopPrice,
  side,
  lastMultiplier
) => {
  const limitPriceFloat = parseFloat(limitPrice);
  const stopPriceFloat = parseFloat(stopPrice);
  const lastMultiplierFloat = parseFloat(lastMultiplier);

  const riskPerShare = calculateRiskPerShare(limitPriceFloat, stopPriceFloat);

  if (side === "buy") {
    return limitPriceFloat + riskPerShare * lastMultiplierFloat;
  }
  return limitPriceFloat - riskPerShare * lastMultiplierFloat;
};

export const calculatePositionSize = (limitPrice, stopPrice, accountSize) => {
  const limitPriceFloat = parseFloat(limitPrice);
  const stopPriceFloat = parseFloat(stopPrice);
  const accountSizeInt = parseInt(accountSize);

  const risk = accountSizeInt * riskPercentage;
  const riskPerShare = calculateRiskPerShare(limitPriceFloat, stopPriceFloat);

  return Math.round(risk / riskPerShare);
};

export const calculateMoneyUpfront = (limitPrice, stopPrice, accountSize) => {
  const limitPriceFloat = parseFloat(limitPrice);

  const positionSize = calculatePositionSize(
    limitPrice,
    stopPrice,
    accountSize
  );

  return limitPriceFloat * positionSize;
};

export const calculateProfitLoss = (
  currentPrice,
  side,
  currentShares,
  initialShares,
  entryPrice,
  profitTargets
) => {
  const currentPriceFloat = parseFloat(currentPrice);
  const currentSharesInt = parseInt(currentShares);
  const initialSharesInt = parseInt(initialShares);
  const entryPriceFloat = parseFloat(entryPrice);

  let filledEarnings = 0.0;
  if (profitTargets?.length > 0) {
    profitTargets.forEach((profitTarget) => {
      const { filled, quantity, filled_avg_price } = profitTarget;
      if (filled) filledEarnings += quantity * filled_avg_price;
    });
  }
  const unFilledCurrentValue = currentSharesInt * currentPriceFloat;
  const purchaseValue = initialSharesInt * entryPriceFloat;
  const combinedCurrentValue = filledEarnings + unFilledCurrentValue;

  if (side === "long") {
    return combinedCurrentValue - purchaseValue;
  }
  return purchaseValue - combinedCurrentValue;
};

export const calculateDefaultStopPrice = (side, limitPrice) => {
  const limitPriceFloat = parseFloat(limitPrice);

  let defaultStopPrice = limitPriceFloat + defaultStopPriceDifference;
  if (side === "sell") {
    defaultStopPrice = limitPriceFloat - defaultStopPriceDifference;
  }

  return defaultStopPrice;
};

export const sumObjectValues = (obj) =>
  Object.values(obj).reduce((a, b) => a + b);
