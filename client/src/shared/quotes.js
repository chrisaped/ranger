export const displayOrderButton = (side, symbol, tradeableAssets) => {
  let buttonText = "Long";
  let buttonClass = "btn btn-success";

  if (side === "sell") {
    buttonText = "Short";
    buttonClass = "btn btn-danger";
    if (!isShortable(symbol, tradeableAssets)) {
      buttonText = "N/A";
    }
  }

  return { buttonText, buttonClass };
};

export const isForbiddenStopPrice = (side, stopPrice, price) => {
  if (side === "buy" && stopPrice > price) return true;
  if (side === "sell" && stopPrice < price) return true;
  return false;
};

const isShortable = (symbol, tradeableAssets) => {
  const assetsObject = tradeableAssets[symbol];
  return assetsObject?.shortable;
};

const isProperPositionSize = (positionSize) => positionSize !== 0;

export const isDisabled = (
  side,
  stopPrice,
  currentPrice,
  symbol,
  positionSize,
  tradeableAssets,
  limitPrice,
  moneyUpfront,
  accountSize
) => {
  if (!limitPrice || !stopPrice) return true;

  const accountSizeFloat = parseFloat(accountSize);
  if (moneyUpfront >= accountSizeFloat) return true;

  if (side === "sell") {
    if (
      isForbiddenStopPrice(side, stopPrice, currentPrice) ||
      !isShortable(symbol, tradeableAssets) ||
      !isProperPositionSize(positionSize)
    )
      return true;
  }

  if (side === "buy") {
    if (
      isForbiddenStopPrice(side, stopPrice, currentPrice) ||
      !isProperPositionSize(positionSize)
    )
      return true;
  }

  return false;
};

export const selectPrice = (priceObj, side) => {
  if (!priceObj) return;

  const { ask, bid } = priceObj;

  let price = ask;
  if (side === "sell") price = bid;

  return price;
};
