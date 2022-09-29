export const determinePositionOrderSide = (side) => {
  let orderSide = "sell";
  if (side === "short") orderSide = "buy";
  return orderSide;
};

export const createBracketOrderObject = (
  symbol,
  side,
  positionSize,
  profitTarget,
  stopPrice,
  limitPrice
) => {
  return {
    side: side,
    symbol: symbol,
    type: "limit",
    limit_price: `${limitPrice}`,
    qty: `${positionSize}`,
    time_in_force: "gtc",
    order_class: "bracket",
    take_profit: {
      limit_price: `${profitTarget}`,
    },
    stop_loss: {
      stop_price: `${stopPrice}`,
    },
  };
};

export const createMarketOrder = (symbol, qty, side) => {
  return {
    side: side,
    symbol: symbol,
    type: "market",
    qty: `${qty}`,
    time_in_force: "gtc",
  };
};

export const createLimitOrder = (symbol, qty, side, limitPrice) => {
  return {
    side: side,
    symbol: symbol,
    type: "limit",
    limit_price: `${limitPrice}`,
    qty: `${qty}`,
    time_in_force: "gtc",
  };
};

export const createStopOrder = (symbol, qty, side, stopPrice) => {
  return {
    side: side,
    symbol: symbol,
    type: "market",
    stop_price: `${stopPrice}`,
    qty: `${qty}`,
    time_in_force: "gtc",
  };
};

export const createLimitOrderWithStop = (
  symbol,
  qty,
  side,
  limitPrice,
  stopPrice
) => {
  return {
    side: side,
    symbol: symbol,
    type: "limit",
    limit_price: `${limitPrice}`,
    qty: `${qty}`,
    time_in_force: "gtc",
    stop_price: `${stopPrice}`,
  };
};

export const createOrder = (socket, orderObject) => {
  socket.emit("createOrder", orderObject);
};

export const createNewOrder = (socket, orderObject) => {
  socket.emit("createNewOrder", orderObject);
};

export const cancelOrder = (socket, orderObject) => {
  socket.emit("cancelOrder", orderObject);
};
