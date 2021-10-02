import PositionsTableRowData from "./PositionsTableRowData";
import { calculateProfitLoss } from "../shared/calculations";

export default function PositionsTable({ socket, positions, orders, quotes }) {
  const getRowClassName = (profitOrLoss) => {
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

  const positionsTableData = positions.map(positionObj => {
    const {
      symbol,
      side,
      avg_entry_price,
      qty
    } = positionObj;
    const quantity = Math.abs(qty);
    const price = quotes[symbol];
    const profitOrLoss = (calculateProfitLoss(price, avg_entry_price, quantity, side)).toFixed(2);
    const rowClassName = getRowClassName(profitOrLoss);

    return (
      <tr className={rowClassName} key={symbol}>
        <PositionsTableRowData 
          socket={socket}
          symbol={symbol}
          side={side}
          avgEntryPrice={avg_entry_price}
          price={price}
          profitOrLoss={profitOrLoss}
          quantity={quantity}
          orders={orders}
        />
      </tr>
    );
  })

  return (
    <table className="table table-bordered align-middle text-center">
      <thead className="table-dark">
        <tr>
          <th>Symbol</th>
          <th>Side</th>
          <th>Entry</th>
          <th>Price</th>
          <th>Target</th>
          <th>Stop</th>
          <th>P/L</th>
          <th>Shares</th>
          <th>Cost</th>
          <th colSpan="2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {positionsTableData}
      </tbody>
    </table>
  );
}
