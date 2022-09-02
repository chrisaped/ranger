import React from "react";
import PropTypes from "prop-types";
import PositionsTableRowData from "./PositionsTableRowData";
import { calculateProfitLoss } from "../shared/calculations";
import { selectPrice } from "../shared/quotes";

export default function PositionsTable({ socket, quotes, orders, positions }) {
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
  };

  const positionsTableData = positions.map((positionObj) => {
    const {
      symbol,
      side,
      current_quantity,
      initial_filled_avg_price,
      profit_targets,
      stop_target,
      initial_quantity,
    } = positionObj;
    const quantity = Math.abs(current_quantity);
    const priceObj = quotes[symbol];
    let price = selectPrice(priceObj, side);
    if (!price) {
      price = parseFloat(initial_filled_avg_price);
    }
    const profitOrLoss = calculateProfitLoss(
      price,
      side,
      quantity,
      initial_quantity,
      initial_filled_avg_price,
      profit_targets
    );
    const rowClassName = getRowClassName(profitOrLoss);

    return (
      <React.Fragment key={symbol}>
        <PositionsTableRowData
          rowClassName={rowClassName}
          socket={socket}
          symbol={symbol}
          side={side}
          initialPrice={initial_filled_avg_price}
          price={price}
          profitOrLoss={profitOrLoss}
          quantity={quantity}
          profitTargets={profit_targets}
          stopTarget={stop_target}
        />
      </React.Fragment>
    );
  });

  return (
    <table className="table table-bordered align-middle text-center">
      <thead className="table-dark">
        <tr>
          <th>Symbol</th>
          <th>Side</th>
          <th>Entry</th>
          <th>Stop</th>
          <th>Price</th>
          <th>1x</th>
          <th>2x</th>
          <th>3x</th>
          <th>P/L</th>
          <th>Shares</th>
          <th>Cost</th>
          <th colSpan="2">Actions</th>
        </tr>
      </thead>
      <tbody>{positionsTableData}</tbody>
    </table>
  );
}

PositionsTable.propTypes = {
  socket: PropTypes.object.isRequired,
  quotes: PropTypes.object.isRequired,
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string,
      filled_qty: PropTypes.string,
      filled_avg_price: PropTypes.string,
      status: PropTypes.string,
      legs: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string,
          limit_price: PropTypes.string,
          id: PropTypes.string,
          status: PropTypes.string,
          stop_price: PropTypes.string,
        })
      ),
    })
  ).isRequired,
  positions: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string,
      side: PropTypes.string,
      avg_entry_price: PropTypes.string,
      qty: PropTypes.string,
      current_price: PropTypes.string,
    })
  ).isRequired,
};

PositionsTable.defaultProps = {
  socket: {},
  quotes: {},
  orders: [],
  positions: [],
};
