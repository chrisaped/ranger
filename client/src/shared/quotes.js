export const displayOrderButton = (side, symbol, tradeableAssets) => {
  let buttonText = 'Long';
  let buttonClass = "btn btn-success";

  if (side === 'sell') {
    buttonText = 'Short';
    buttonClass = "btn btn-danger";
    if (!isShortable(symbol, tradeableAssets)) {
      buttonText = 'Not Shortable'
    }
  }

  return { buttonText, buttonClass };
}

export const isForbiddenStopPrice = (side, stopPrice, price) => {
  if ((side === 'buy') && (stopPrice > price)) {
    return true;
  }
  if ((side === 'sell') && (stopPrice < price)) {
    return true;
  }
  return false;    
};

const isShortable = (symbol, tradeableAssets) => {
  const assetsObject = tradeableAssets[symbol];
  return assetsObject?.shortable;
};

const isProperPositionSize = (positionSize) => {
  if (positionSize === 0) {
    return false;
  }
  return true;
};

export const isDisabled = (side, stopPrice, currentPrice, symbol, positionSize, tradeableAssets) => {
  if (side === 'sell') {
    if (
      isForbiddenStopPrice(side, stopPrice, currentPrice) || 
      !isShortable(symbol, tradeableAssets) ||
      !isProperPositionSize(positionSize)
    ) {
      return true;
    }
  }

  if (side === 'buy') {
    if (
      isForbiddenStopPrice(side, stopPrice, currentPrice) ||
      !isProperPositionSize(positionSize)
    ) {
      return true;
    }
  }

  return false;
};
