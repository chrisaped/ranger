import {
  riskPercentage,
  defaultStopPriceDifference,
  profitTargetMultiple,
} from "./constants";

const calculateRiskPerShare = (limitPrice, stopPrice) => {
  return Math.abs(limitPrice - stopPrice);
};

export const calculateProfitTarget = (limitPrice, stopPrice, side) => {
  const limitPriceFloat = parseFloat(limitPrice);
  const stopPriceFloat = parseFloat(stopPrice);
  const riskPerShare = calculateRiskPerShare(limitPriceFloat, stopPriceFloat);
  if (side === "buy") {
    return (limitPriceFloat + riskPerShare * profitTargetMultiple)?.toFixed(2);
  }
  return (limitPriceFloat - riskPerShare * profitTargetMultiple)?.toFixed(2);
};

export const calculatePositionSize = (limitPrice, stopPrice, accountSize) => {
  const limitPriceFloat = parseFloat(limitPrice);
  const stopPriceFloat = parseFloat(stopPrice);
  const accountSizeFloat = parseFloat(accountSize);
  const risk = accountSizeFloat * riskPercentage;
  const riskPerShare = calculateRiskPerShare(limitPriceFloat, stopPriceFloat);
  return Math.round(risk / riskPerShare);
};

export const calculateMoneyUpfront = (limitPrice, stopPrice, accountSize) => {
  const limitPriceFloat = parseFloat(limitPrice);
  const stopPriceFloat = parseFloat(stopPrice);
  const accountSizeFloat = parseFloat(accountSize);
  const positionSize = calculatePositionSize(
    limitPriceFloat,
    stopPriceFloat,
    accountSizeFloat
  );
  return limitPrice * positionSize;
};

export const calculateProfitLoss = (currentPrice, entryPrice, shares, side) => {
  const purchaseValue = shares * entryPrice;
  const currentValue = shares * currentPrice;
  if (side === "long") {
    return currentValue - purchaseValue;
  }
  return purchaseValue - currentValue;
};

export const calculateProfitLossByValues = (
  purchaseValue,
  childValue,
  side
) => {
  if (side === "buy") {
    return (childValue - purchaseValue).toFixed(2);
  }
  return (purchaseValue - childValue).toFixed(2);
};

export const isInProfit = (calculatedProfitLoss) => {
  const plFloat = parseFloat(calculatedProfitLoss);
  if (plFloat > 0) {
    return true;
  }
  return false;
};

export const calculateDefaultStopPrice = (side, limitPrice) => {
  const limitPriceFloat = parseFloat(limitPrice);
  let defaultStopPrice = limitPriceFloat + defaultStopPriceDifference;
  if (side === "sell") {
    defaultStopPrice = limitPriceFloat - defaultStopPriceDifference;
  }
  return defaultStopPrice?.toFixed(2);
};

export const sumObjectValues = (obj) =>
  Object.values(obj).reduce((a, b) => a + b);
