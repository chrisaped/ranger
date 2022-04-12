import { displayPrice } from "./formatting";
import { calculateProfitLossByValues } from "./calculations";

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
    limit_price: limitPrice,
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
  let action = "sell";
  if (side === "short") {
    action = "buy";
  }
  return {
    side: action,
    symbol: symbol,
    type: "market",
    qty: `${qty}`,
    time_in_force: "gtc",
  };
};

export const createOrder = (socket, orderObject) => {
  socket.emit("createOrder", orderObject);
};

export const cancelOrder = (socket, orderId) => {
  socket.emit("cancelOrder", orderId);
};

export const extractBracketOrderInfo = (
  symbol,
  qty,
  avg_entry_price,
  orders
) => {
  let legs = [];
  let targetPrice;
  let stopPrice;
  let targetOrderId;
  let targetOrderStatus;

  orders.forEach((orderObj) => {
    if (
      orderObj.symbol === symbol &&
      orderObj.filled_qty === `${qty}` &&
      orderObj.filled_avg_price === avg_entry_price &&
      orderObj.status === "filled"
    ) {
      legs = orderObj.legs;
    }
  });

  legs.forEach((leg) => {
    if (leg.type === "limit") {
      targetPrice = leg.limit_price;
      targetOrderId = leg.id;
      targetOrderStatus = leg.status;
    }
    if (leg.type === "stop") {
      stopPrice = leg.stop_price;
    }
  });

  targetPrice = displayPrice(targetPrice);
  stopPrice = displayPrice(stopPrice);

  const hasLegs = legs.length > 0;

  return {
    targetPrice,
    targetOrderStatus,
    stopPrice,
    targetOrderId,
    hasLegs,
  };
};

const createFilledOrderObjectsArray = (orders) => {
  // orders from alpaca need to be in ascending order
  let filledOrdersWithLegsArray = [];
  orders.forEach((orderObj) => {
    if (orderObj.status === "filled") {
      filledOrdersWithLegsArray.push(orderObj);
      if (orderObj.legs?.length > 0) {
        filledOrdersWithLegsArray = filledOrdersWithLegsArray.concat(
          orderObj.legs
        );
      }
    }
  });

  // the legs may not have been filled
  const allFilledOrdersArray = filledOrdersWithLegsArray.filter((orderObj) => {
    return orderObj.status === "filled";
  });

  const filledOrdersWithSelectFields = [];
  allFilledOrdersArray.forEach((orderObj) => {
    const newOrderObj = {};
    const { symbol, side, filled_qty, filled_avg_price } = orderObj;

    newOrderObj["symbol"] = symbol;
    newOrderObj["side"] = side;
    newOrderObj["filled_qty"] = parseInt(filled_qty);
    newOrderObj["filled_avg_price"] = parseFloat(filled_avg_price).toFixed(2);

    filledOrdersWithSelectFields.push(newOrderObj);
  });

  return filledOrdersWithSelectFields;
};

const handleSymbolInfo = (filled_qty, filled_avg_price, symbolObj) => {
  const value = filled_qty * filled_avg_price;
  symbolObj.child_value_total += value;
  symbolObj.child_quantity_total += filled_qty;
  if (symbolObj.child_quantity_total === symbolObj.quantity) {
    const totalProfitLoss = calculateProfitLossByValues(
      symbolObj.purchase_value,
      symbolObj.child_value_total,
      symbolObj.side
    );
    symbolObj.total_profit_loss = parseFloat(totalProfitLoss);
    symbolObj.more_order_info_needed = false;
  }
};

const newSymbolInfoObj = (side, filled_qty, filled_avg_price) => {
  return {
    side: side,
    quantity: filled_qty,
    price: filled_avg_price,
    purchase_value: parseFloat(filled_qty * filled_avg_price).toFixed(2),
    child_quantity_total: 0,
    child_value_total: 0,
    more_order_info_needed: true,
    total_profit_loss: 0,
  };
};

export const extractTotalProfitLossFromClosedOrders = (orders) => {
  const filledOrders = createFilledOrderObjectsArray(orders);
  // orders from alpaca need to be in ascending order
  const totalProfitLossBySymbol = {};
  const duplicateSymbols = {};

  filledOrders.forEach((orderObj) => {
    const { symbol, side, filled_qty, filled_avg_price } = orderObj;
    if (symbol in totalProfitLossBySymbol) {
      const symbolObj = totalProfitLossBySymbol[symbol];
      if (symbolObj.more_order_info_needed) {
        handleSymbolInfo(filled_qty, filled_avg_price, symbolObj);
      } else {
        if (symbol in duplicateSymbols) {
          const duplicateCount = duplicateSymbols[symbol];
          const duplicateSymbol = `${symbol}_${duplicateCount}`;
          const symbolObj = totalProfitLossBySymbol[duplicateSymbol];
          if (symbolObj.more_order_info_needed) {
            handleSymbolInfo(filled_qty, filled_avg_price, symbolObj);
          } else {
            duplicateSymbols[symbol] += 1;
            const duplicateCount = duplicateSymbols[symbol];
            const duplicateSymbol = `${symbol}_${duplicateCount}`;
            totalProfitLossBySymbol[duplicateSymbol] = newSymbolInfoObj(
              side,
              filled_qty,
              filled_avg_price
            );
          }
        } else {
          duplicateSymbols[symbol] = 1;
          const duplicateSymbol = `${symbol}_${1}`;
          totalProfitLossBySymbol[duplicateSymbol] = newSymbolInfoObj(
            side,
            filled_qty,
            filled_avg_price
          );
        }
      }
    } else {
      totalProfitLossBySymbol[symbol] = newSymbolInfoObj(
        side,
        filled_qty,
        filled_avg_price
      );
    }
  });

  let totalProfitLoss = 0;
  Object.entries(totalProfitLossBySymbol).forEach(([_symbol, symbolObj]) => {
    totalProfitLoss += symbolObj.total_profit_loss;
  });

  return totalProfitLoss;
};
