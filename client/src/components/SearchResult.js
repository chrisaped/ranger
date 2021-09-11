import { useState } from "react";
import {
  calculatePositionSize,
  calculatProfitTarget
} from "../shared/calculations";

export default function SearchResult({ quote }) {
  const { Symbol, AskPrice } = quote;
  const defaultStopPrice = AskPrice - .25;

  const [stopPrice, setStopPrice] = useState(defaultStopPrice);

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
            <td>{calculatProfitTarget(AskPrice, stopPrice)}</td>
            <td>{calculatePositionSize(AskPrice, stopPrice)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
