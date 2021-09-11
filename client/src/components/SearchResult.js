import { useState } from "react";
import {
  calculatProfitTarget,
  calculatePositionSize,
  calculateMoneyUpfront
} from "../shared/calculations";

export default function SearchResult({ socket, quote, setQuote }) {
  const { Symbol, AskPrice } = quote;
  const defaultStopPrice = AskPrice - .25;

  const [stopPrice, setStopPrice] = useState(defaultStopPrice);
  const profitTarget = calculatProfitTarget(AskPrice, stopPrice);
  const positionSize = calculatePositionSize(AskPrice, stopPrice);
  const moneyUpfront = calculateMoneyUpfront(AskPrice, stopPrice);

  const orderObject = {
    "side": "buy",
    "symbol": Symbol,
    "type": "market",
    "qty": `${positionSize}`,
    "time_in_force": "day",
    "order_class": "bracket",
    "take_profit": {
      "limit_price": `${profitTarget}`
    },
    "stop_loss": {
      "stop_price": `${stopPrice}`
    }
  };

  const createOrder = () => {
    socket.emit('createOrder', orderObject);
    setQuote({});
  };

  const addToWatchlist = () => {
    socket.emit('addToWatchlist', Symbol);
  }

  return (
    <div>
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Symbol</th>
            <th>Current Price</th>
            <th>Stop Price</th>
            <th>Target Price</th>
            <th>Shares</th>
            <th>Money Upfront</th>
            <th colSpan="2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>{Symbol}</strong></td>
            <td>{AskPrice}</td>
            <td>
              <input 
                className="form-control"
                type="text" 
                placeholder="Stop Price"
                value={stopPrice} 
                onChange={(e) => setStopPrice(e.target.value)} 
              />              
            </td>
            <td>{profitTarget}</td>
            <td>{positionSize}</td>
            <td>${moneyUpfront}</td>
            <td>
              <button 
                className="btn btn-success m-2" 
                onClick={createOrder}
                // disabled= if I dont have enough money
              >
                Long
              </button>
            </td>
            {/* <td>
              <button 
                className="btn btn-danger m-2" 
                // onClick={}
                // disabled= if I dont have enough money
              >
                Short
              </button>              
            </td> */}
            <td>
              <button 
                className="btn btn-secondary m-2" 
                onClick={addToWatchlist}
              >
                Watchlist
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
