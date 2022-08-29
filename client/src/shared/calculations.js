import {
  riskPercentage,
  defaultStopPriceDifference,
  profitTarget,
  VWAPPercentageDifference,
} from "./constants";

const calculateRiskPerShare = (limitPrice, stopPrice) => {
  return Math.abs(limitPrice - stopPrice);
};

const calculateProfitTargetMultiple = (
  limitPrice,
  positionSize,
  riskPerShare
) => {
  return (
    ((profitTarget + limitPrice * positionSize) / positionSize - limitPrice) /
    riskPerShare
  );
};

export const calculateProfitTarget = (
  limitPrice,
  stopPrice,
  side,
  positionSize
) => {
  const limitPriceFloat = parseFloat(limitPrice);
  const stopPriceFloat = parseFloat(stopPrice);
  const riskPerShare = calculateRiskPerShare(limitPriceFloat, stopPriceFloat);
  const profitTargetMultiple = calculateProfitTargetMultiple(
    limitPriceFloat,
    positionSize,
    riskPerShare
  );

  if (side === "buy") {
    return (limitPriceFloat + riskPerShare * profitTargetMultiple)?.toFixed(2);
  }
  return (limitPriceFloat - riskPerShare * profitTargetMultiple)?.toFixed(2);
};

export const calculate1xProfitTarget = (limitPrice, stopPrice, side) => {
  const limitPriceFloat = parseFloat(limitPrice);
  const stopPriceFloat = parseFloat(stopPrice);
  const riskPerShare = calculateRiskPerShare(limitPriceFloat, stopPriceFloat);

  if (side === "buy") {
    return (limitPriceFloat + riskPerShare)?.toFixed(2);
  }
  return (limitPriceFloat - riskPerShare)?.toFixed(2);
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

export const calculateProfitLoss = (
  currentPrice,
  entryPrice,
  shares,
  side,
  grossEarnings
) => {
  const grossEarningsFloat = parseFloat(grossEarnings);
  const purchaseValue = shares * entryPrice;
  const currentValue = shares * currentPrice;
  const combinedCurrentValue = currentValue + grossEarningsFloat;
  if (side === "long") {
    return combinedCurrentValue - purchaseValue;
  }
  return purchaseValue - combinedCurrentValue;
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

export const calculateDefaultStopPrice = (side, limitPrice, VWAP) => {
  const limitPriceFloat = parseFloat(limitPrice);
  let defaultStopPrice = limitPriceFloat + defaultStopPriceDifference;
  if (VWAP !== 0) defaultStopPrice = VWAP + VWAP * VWAPPercentageDifference;
  if (side === "sell") {
    defaultStopPrice = limitPriceFloat - defaultStopPriceDifference;
    if (VWAP !== 0) defaultStopPrice = VWAP - VWAP * VWAPPercentageDifference;
  }
  return defaultStopPrice?.toFixed(2);
};

export const sumObjectValues = (obj) =>
  Object.values(obj).reduce((a, b) => a + b);
