import { useState } from "react";
import { displayCost, displayPrice } from "../shared/formatting";

export default function PositionsTable({ socket, positions, orders, quotes }) {
  const [submitted, setSubmitted] = useState({});

  const createOrderSellObject = (symbol, qty) => {
    return (
      {
        "side": "sell",
        "symbol": symbol,
        "type": "market",
        "qty": `${qty}`,
        "time_in_force": "day"
      }
    );
  };

  const createOrder = (orderObject, clientOrderId) => {
    updateSubmitted(clientOrderId, true);
    socket.emit('createOrder', orderObject);
  };

  const updateSubmitted = (clientOrderId, boolean) => {
    setSubmitted((prevState) => ({ ...prevState, [clientOrderId]: boolean }));
  };

  const getOrderObj = (symbol, qty, avg_entry_price) => {
    let clientOrderId;
    let legs = [];
    let targetPrice;
    let stopPrice;
    let targetOrderId;
    let targetOrderStatus;
    let stopOrderId;
    let stopOrderStatus;

    orders.forEach((orderObj) => {
      if (
        (orderObj.symbol === symbol) && 
        (orderObj.qty === qty) &&
        (orderObj.filled_avg_price === avg_entry_price) &&
        orderObj.status === "filled"
      ) {
        clientOrderId = orderObj.client_order_id;
        updateSubmitted(clientOrderId, false);
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
        stopOrderId = leg.id
        stopOrderStatus = leg.status;
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
      stopOrderStatus,
      targetOrderId,
      stopOrderId,
      hasLegs
    };
  }

  const isInProfit = (pl) => {
    const plFloat = parseFloat(pl);
    if (plFloat > 0) {
      return true;
    }
    return false;
  };

  const cancelOrder = (orderId) => {
    socket.emit('cancelOrder', orderId);
  };
  
  return (
    <table className="table table-bordered">
      {positions.map((positionObj, index) => {
        const {
          symbol,
          side,
          avg_entry_price,
          qty,
          cost_basis,
          unrealized_intraday_pl
        } = positionObj;
        const { 
          clientOrderId,
          targetPrice, 
          targetOrderStatus,
          stopPrice,
          stopOrderStatus,
          targetOrderId,
          stopOrderId,
          hasLegs
        } = getOrderObj(symbol, qty, avg_entry_price);
        const currentPrice = displayPrice(quotes[symbol]);
        const entryPrice = displayPrice(avg_entry_price);
        const orderSellObject = createOrderSellObject(symbol, qty);
        const cost = displayCost(cost_basis);

        return (
          <>
            <thead className="table-dark">
              <tr>
                <th>Symbol</th>
                <th>Side</th>
                <th>Current Price</th>
                <th>Entry Price</th>
                <th>Shares</th>
                <th>Cost</th>
                <th>P/L</th>
                <th colSpan="1">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                key={index} 
                className={
                  isInProfit(unrealized_intraday_pl) ? "table-success" : "table-danger"
                }
              >
                <td><strong>{symbol}</strong></td>
                <td>{side.toUpperCase()}</td>
                <td><strong>{currentPrice}</strong></td>
                <td>{entryPrice}</td>
                <td>{qty} shares</td>
                <td>${cost}</td>
                <td>${unrealized_intraday_pl}</td>
                <td>
                {submitted[clientOrderId] === true ? (
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                ):(
                  <button 
                    className="btn btn-dark m-2" 
                    onClick={() => createOrder(orderSellObject, clientOrderId)}
                  >
                    Sell
                  </button>
                )}
                </td>            
              </tr>
              {hasLegs && (
              <>
                <tr>
                  <td className="bg-dark text-white fw-bold">
                    Take Profit
                  </td>
                  <td className="bg-secondary text-white">Price</td>
                  <td>{targetPrice}</td>
                  <td className="bg-secondary text-white">Status</td>
                  <td>{targetOrderStatus}</td>
                  <td className="bg-light" colSpan="3">
                    <button 
                      className="btn btn-outline-dark btn-sm m-2"
                      disabled={targetOrderStatus === "filled" || "canceled"}
                      onClick={() => cancelOrder(targetOrderId)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="bg-dark text-white fw-bold">
                    Stop Loss
                  </td>
                  <td className="bg-secondary text-white">Price</td>
                  <td>{stopPrice}</td>
                  <td className="bg-secondary text-white">Status</td>
                  <td>{stopOrderStatus}</td>
                  <td className="bg-light" colSpan="3">
                    <button 
                      className="btn btn-outline-dark btn-sm m-2"
                      disabled={stopOrderStatus === "filled" || "canceled"}
                      onClick={() => cancelOrder(stopOrderId)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              </>
              )}
            </tbody>
          </>
        );
      })}
    </table>
  );
}
