import { displayCost, displayPrice } from "../shared/formatting";

export default function PositionsTable({ socket, positions, orders, quotes }) {
  const createOrderObject = (symbol, qty) => {
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

  const getBracketPrices = (symbol) => {
    let targetPrice;
    let stopPrice;

    orders.forEach((orderObj) => {
      if (orderObj.symbol === symbol) {
        targetPrice = orderObj.limit_price;
        stopPrice = orderObj.stop_price;
      }
    })

    targetPrice = displayPrice(targetPrice);
    stopPrice = displayPrice(stopPrice);

    return { targetPrice, stopPrice };
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
      <thead className="table-dark">
        <tr>
          <th>Symbol</th>
          <th>Side</th>
          <th>Current Price</th>
          <th>Target Price</th>
          <th>Stop Price</th>
          <th>Entry Price</th>
          <th>Shares</th>
          <th>Cost</th>
          <th>P/L</th>
          <th colSpan="1">Actions</th>
        </tr>
      </thead>
      <tbody>
      {positions.map((positionObj, index) => {
        const {
          symbol,
          side,
          avg_entry_price,
          qty,
          cost_basis,
          unrealized_intraday_pl
        } = positionObj;

        console.log('here are the quotes', quotes);
        const orderObject = createOrderObject(symbol, qty);
        const { targetPrice, stopPrice } = getBracketPrices(symbol);
        const currentPrice = displayPrice(quotes[symbol]);
        const cost = displayCost(cost_basis);

        return (
          <tr 
            key={index} 
            className={
              isInProfit(unrealized_intraday_pl) ? "table-success" : "table-danger"
            }
          >
            <td><strong>{symbol}</strong></td>
            <td>{side.toUpperCase()}</td>
            <td><strong>{currentPrice}</strong></td>
            <td>{targetPrice}</td>
            <td>{stopPrice}</td>
            <td>{avg_entry_price}</td>
            <td>{qty}</td>
            <td>${cost}</td>
            <td>{unrealized_intraday_pl}</td>
            <td>
              <button 
                className="btn btn-dark m-2" 
                onClick={() => createOrder(orderObject)}
                // disabled= if I dont have enough money
              >
                Sell
              </button>
            </td>            
          </tr>
        );
      })}
      </tbody>
    </table>
  );
}
