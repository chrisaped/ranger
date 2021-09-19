import { displayCost, displayPrice } from "../shared/formatting";

export default function PositionsTable({ socket, positions, orders, quotes }) {
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

  const createOrder = (orderObject) => {
    socket.emit('createOrder', orderObject);
  };

  const getOrderObj = (symbol, qty, avg_entry_price) => {
    let parentOrderStatus;
    let legs = [];
    let targetPrice;
    let stopPrice;
    let targetOrderStatus;
    let stopOrderStatus;

    orders.forEach((orderObj) => {
      if (
        (orderObj.symbol === symbol) && 
        (orderObj.qty === qty) &&
        (orderObj.filled_avg_price === avg_entry_price) &&
        orderObj.status === "filled"
      ) {
        parentOrderStatus = orderObj.status;
        legs = orderObj.legs;
      }
    });

    legs.forEach((leg) => {
      if (leg.type === 'limit') {
        targetPrice = leg.limit_price;
        targetOrderStatus = leg.status;
      }
      if (leg.type === 'stop') {
        stopPrice = leg.stop_price;
        stopOrderStatus = leg.status;
      }
    });

    targetPrice = displayPrice(targetPrice);
    stopPrice = displayPrice(stopPrice);

    return { 
      parentOrderStatus, 
      targetPrice, 
      targetOrderStatus,
      stopPrice,
      stopOrderStatus
    };
  }

  const isInProfit = (pl) => {
    const plFloat = parseFloat(pl);
    if (plFloat > 0) {
      return true;
    }
    return false;
  }
  
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
          parentOrderStatus, 
          targetPrice, 
          targetOrderStatus,
          stopPrice,
          stopOrderStatus
        } = getOrderObj(symbol, qty, avg_entry_price);
        let currentPrice = displayPrice(quotes[symbol]);
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
                <th>Status</th>
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
                <td>{avg_entry_price}</td>
                <td>{qty} shares</td>
                <td>${cost}</td>
                <td>${unrealized_intraday_pl}</td>
                <td>{parentOrderStatus}</td>
                <td>
                  <button 
                    className="btn btn-dark m-2" 
                    onClick={() => createOrder(orderSellObject)}
                    // disabled= if I dont have enough money
                  >
                    Sell
                  </button>
                </td>            
              </tr>
              <tr>
                <td className="bg-dark text-white fw-bold">
                  Take Profit
                </td>
                <td className="bg-secondary text-white">Price</td>
                <td>{targetPrice}</td>
                <td className="bg-secondary text-white">Status</td>
                <td>{targetOrderStatus}</td>
                <td className="bg-light" colSpan="4">
                  <button 
                    className="btn btn-outline-dark btn-sm m-2"
                    disabled={targetOrderStatus === "filled" || "canceled"}
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
                <td className="bg-light" colSpan="4">
                  <button 
                    className="btn btn-outline-dark btn-sm m-2"
                    disabled={stopOrderStatus === "filled" || "canceled"}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            </tbody>
          </>
        );
      })}
    </table>
  );
}
