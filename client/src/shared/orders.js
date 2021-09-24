import { displayPrice } from "./formatting";
import { calculateProfitLoss } from "./calculations";

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


export const extractProfitLoss = (orders, symbol, currentPrice) => {
  // orders from alpaca need to be in ascending order
  const ordersArray = [];

  orders.forEach(orderObj => {
    if ((orderObj.symbol === symbol) && (orderObj.status === 'filled')) {
      ordersArray.push(orderObj);
    }
    if (orderObj.legs?.length > 0) {
      ordersArray.concat(orderObj.legs);
    }
  })

  let totalProfitLoss;

  const parentOrderObj = ordersArray[0];
  const parentQuantity = parentOrderObj.filled_qty;
  const parentSide = parentOrderObj.side;
  const parentPrice = parentOrderObj.filled_avg_price;
  
  // closed position
  if (ordersArray.length > 1) {
    const purchaseValue = parentQuantity * parentPrice;
    let childOrdersTotalQuantity = 0;
    let childOrdersTotalValue = 0;

    for (let i = 1; i < ordersArray.length; i += 1) {
      const orderObj = ordersArray[i];
      const quantity = orderObj.filled_qty;
      const price = orderObj.filled_avg_price;

      const value = quantity * price;
      childOrdersTotalValue += value;
      childOrdersTotalQuantity += quantity;
      if (childOrdersTotalQuantity === parentQuantity) {
        break;
      }
    }

    if (parentSide === 'long') {
      totalProfitLoss = (childOrdersTotalValue - purchaseValue).toFixed(2);
    }
    totalProfitLoss = (purchaseValue - childOrdersTotalValue).toFixed(2);
  }

  // current position
  if (ordersArray.length === 1) {
    totalProfitLoss = calculateProfitLoss(currentPrice, parentPrice, parentQuantity, parentSide);
  }

  return totalProfitLoss;
}
