export const createBracketOrder = (
  symbol, 
  side,
  positionSize, 
  profitTarget, 
  stopPrice
) => {  
  return (
    {
      "side": side,
      "symbol": symbol,
      "type": "market",
      "qty": `${positionSize}`,
      "time_in_force": "day",
      "order_class": "bracket",
      "take_profit": {
        "limit_price": `${profitTarget}`
      },
      "stop_loss": {
        "stop_price": `${stopPrice}`,
      }
    }
  );
};

export const createMarketOrder = (symbol, qty, side) => {
  let action = "sell";
  if (side === "sell") {
    action = "buy";
  }

  return (
    {
      "side": action,
      "symbol": symbol,
      "type": "market",
      "qty": `${qty}`,
      "time_in_force": "day"
    }
  );
};
