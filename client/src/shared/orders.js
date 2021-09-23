import { displayPrice } from "./formatting";

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

export const createOrder = (socket, orderObject) => {
  socket.emit('createOrder', orderObject);
};

export const cancelOrder = (socket, orderId) => {
  socket.emit('cancelOrder', orderId);
};

export const extractBracketOrderInfo = (symbol, qty, avg_entry_price, orders) => {
  let clientOrderId;
  let legs = [];
  let targetPrice;
  let stopPrice;
  let targetOrderId;
  let targetOrderStatus;

  orders.forEach((orderObj) => {
    if (
      (orderObj.symbol === symbol) && 
      (orderObj.qty === qty) &&
      (orderObj.filled_avg_price === avg_entry_price) &&
      orderObj.status === "filled"
    ) {
      clientOrderId = orderObj.client_order_id;
      legs = orderObj.legs;
    }
  });

  legs.forEach((leg) => {
    if (leg.type === 'limit') {
      targetPrice = leg.limit_price;
      targetOrderId = leg.id;
      targetOrderStatus = leg.status;
    }
    if (leg.type === 'stop') {
      stopPrice = leg.stop_price;
    }
  });

  targetPrice = displayPrice(targetPrice);
  stopPrice = displayPrice(stopPrice);
  
  const hasLegs = legs.length > 0;

  return { 
    clientOrderId,
    targetPrice, 
    targetOrderStatus,
    stopPrice,
    targetOrderId,
    hasLegs
  };
};
