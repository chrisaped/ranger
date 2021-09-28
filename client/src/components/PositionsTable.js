import { displayPrice } from "../shared/formatting";
import { calculateProfitLoss } from "../shared/calculations";
import { 
  createMarketOrder,
  createOrder,
  cancelOrder,
  extractBracketOrderInfo
} from "../shared/orders";
import SpinnerButton from "./SpinnerButton";

export default function PositionsTable({ socket, positions, orders, quotes }) {
  const rowClassName = (profitOrLoss) => {
    let rowClass;
    if (profitOrLoss > 0) {
      rowClass = "table-success";
    } else if (profitOrLoss < 0) {
      rowClass = "table-danger";
    } else {
      rowClass = "table-light";
    }
    return rowClass;
  }

  return (
    <div>
    {positions.map((positionObj) => {
      const {
        symbol,
        side,
        avg_entry_price,
        qty
      } = positionObj;
      const quantity = Math.abs(qty);
      const { 
        clientOrderId,
        targetPrice, 
        targetOrderStatus,
        stopPrice,
        targetOrderId,
        hasLegs
      } = extractBracketOrderInfo(symbol, quantity, avg_entry_price, orders);
      const currentPrice = displayPrice(quotes[symbol]);
      const entryPrice = displayPrice(avg_entry_price);
      const marketOrder = createMarketOrder(symbol, quantity, side);
      const submitOrder = () => createOrder(socket, marketOrder);
      const cost = entryPrice * quantity;
      const cancelBracket = () => cancelOrder(socket, targetOrderId);
      const profitOrLoss = (calculateProfitLoss(currentPrice, entryPrice, quantity, side)).toFixed(2);
      const hasNoBracketOrder = !hasLegs || (targetOrderStatus === "canceled");
      
      return (
        <table className="table table-bordered" key={clientOrderId}>
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
            <tr className={rowClassName(profitOrLoss)}>
              <td><strong>{symbol}</strong></td>
              <td>{side.toUpperCase()}</td>
              <td className="bg-warning"><strong>{currentPrice}</strong></td>
              <td className="bg-info">{entryPrice}</td>
              <td className={hasNoBracketOrder ? 'bg-secondary' : "bg-success text-white"}>{targetPrice}</td>
              <td className={hasNoBracketOrder ? 'bg-secondary' : "bg-danger text-white"}>{stopPrice}</td>
              <td>{quantity} shares</td>
              <td>${cost}</td>
              <td>${profitOrLoss}</td>
              {!hasNoBracketOrder && (
                <td>
                  <SpinnerButton
                    socket={socket}
                    buttonClass="btn btn-dark m-2"
                    buttonText="Cancel Bracket"
                    buttonDisabled={hasNoBracketOrder}
                    onClickFunction={cancelBracket}
                  />
                </td>
              )}
              <td>
                <SpinnerButton 
                  socket={socket}
                  buttonClass="btn btn-dark m-2"
                  buttonText={side === "long" ? "Sell" : "Buy"}
                  buttonDisabled={!hasNoBracketOrder}
                  onClickFunction={submitOrder}
                />
              </td>            
            </tr>
          </tbody>
        </table>
        );
      })}
    </div>
  );
}
