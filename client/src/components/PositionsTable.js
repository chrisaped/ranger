import { displayCost, displayPrice } from "../shared/formatting";
import { calculateProfitLoss } from "../shared/calculations";
import SpinnerButton from "./SpinnerButton";

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
          cost_basis
        } = positionObj;
        const { 
          clientOrderId,
          targetPrice, 
          targetOrderStatus,
          stopPrice,
          targetOrderId,
          hasLegs
        } = getOrderObj(symbol, qty, avg_entry_price);
        const currentPrice = displayPrice(quotes[symbol]);
        const entryPrice = displayPrice(avg_entry_price);
        const orderSellObject = createOrderSellObject(symbol, qty);
        const submitOrder = () => createOrder(orderSellObject);
        const cost = displayCost(cost_basis);
        const cancelBracket = () => cancelOrder(targetOrderId);
        const profitOrLoss = calculateProfitLoss(currentPrice, entryPrice, qty);
        const hasNoBracketOrder = !hasLegs || (targetOrderStatus === "canceled") 

        return (
          <>
            <thead className="table-dark">
              <tr>
                <th>Symbol</th>
                <th>Side</th>
                <th>Current Price</th>
                <th>Entry Price</th>
                <th>Target Price</th>
                <th>Stop Loss</th>
                <th>Shares</th>
                <th>Cost</th>
                <th>P/L</th>
                <th colSpan="2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                key={index} 
                className={
                  isInProfit(profitOrLoss) ? "table-success" : "table-danger"
                }
              >
                <td><strong>{symbol}</strong></td>
                <td>{side.toUpperCase()}</td>
                <td className="bg-warning"><strong>{currentPrice}</strong></td>
                <td className="bg-info">{entryPrice}</td>
                <td className={hasNoBracketOrder ? 'bg-secondary' : "bg-success text-white"}>{targetPrice}</td>
                <td className={hasNoBracketOrder ? 'bg-secondary' : "bg-danger text-white"}>{stopPrice}</td>
                <td>{qty} shares</td>
                <td>${cost}</td>
                <td>${profitOrLoss}</td>
                <td>
                  <SpinnerButton 
                    buttonClass="btn btn-secondary m-2"
                    buttonText="Cancel Bracket"
                    buttonDisabled={hasNoBracketOrder}
                    onClickFunction={cancelBracket}
                  />
                </td>                
                <td>
                  <SpinnerButton 
                    buttonClass="btn btn-dark m-2"
                    buttonText="Sell"
                    onClickFunction={submitOrder}
                  />
                </td>            
              </tr>
            </tbody>
          </>
        );
      })}
    </table>
  );
}
