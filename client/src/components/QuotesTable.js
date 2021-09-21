import {
  calculatProfitTarget,
  calculatePositionSize,
  calculateMoneyUpfront
} from "../shared/calculations";
import { displayPrice } from "../shared/formatting";

export default function QuotesTable({ 
  socket, 
  quotes, 
  stopPrices,
  onStopPriceChange,
  deleteFromWatchlist
}) {
  const createOrderObject = (symbol, positionSize, profitTarget, stopPrice) => {  
    return (
      {
        "side": "buy",
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

  const createOrder = (symbol, orderObject) => {
    deleteFromWatchlist(symbol);
    socket.emit('createOrder', orderObject);
  };

  return (
    <table className="table table-bordered">
      <thead className="table-dark">
        <tr>
          <th>Symbol</th>
          <th>Current Price</th>
          <th>Target Price</th>
          <th>Stop Price</th>
          <th>Shares</th>
          <th>Money Upfront</th>
          <th colSpan="3">Actions</th>
        </tr>
      </thead>
      <tbody>
      {Object.entries(quotes).map(([symbol, price]) => {
        const stopPrice = stopPrices[symbol];
        const profitTarget = calculatProfitTarget(price, stopPrice);
        const positionSize = calculatePositionSize(price, stopPrice);
        const moneyUpfront = calculateMoneyUpfront(price, stopPrice);
        const orderObject = createOrderObject(symbol, positionSize, profitTarget, stopPrice);
        const currentPrice = displayPrice(price);

        return (
          <tr key={symbol}>
            <td><strong>{symbol}</strong></td>
            <td className="bg-warning"><strong>{currentPrice}</strong></td>
            <td className="bg-success text-white">{profitTarget}</td>
            <td>
              <input 
                className="form-control border border-danger"
                type="text" 
                placeholder="Stop Price"
                value={stopPrice} 
                onChange={(e) => onStopPriceChange(symbol, e.target.value)} 
              />         
            </td>
            <td>{positionSize} shares</td>
            <td>${moneyUpfront}</td>
            <td>
              <button 
                className="btn btn-success m-2" 
                onClick={() => createOrder(symbol, orderObject)}
                // disabled= if I dont have enough money
              >
                Long
              </button>
            </td>
            <td>
              <button 
                className="btn btn-danger m-2" 
                // onClick={}
                disabled
              >
                Short
              </button>              
            </td>
            <td>
              <button 
                className="btn btn-secondary m-2" 
                onClick={() => deleteFromWatchlist(symbol)}
              >
                Remove
              </button>
            </td>      
          </tr>
        );
      })}
      </tbody>
    </table>    
  );
}
