import React from "react";
import PropTypes from "prop-types";
import PositionsTableRowData from "./PositionsTableRowData";
import { calculateProfitLoss } from "../shared/calculations";
import { selectPrice } from "../shared/quotes";
import { profitMultipliers } from "../shared/constants";
import { determinePositionOrderSide } from "../shared/orders";

export default function PositionsTable({ socket, quotes, openPositions }) {
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

  const positionsTableData = openPositions.map((positionObj) => {
    const {
      id,
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
    const positionSide = determinePositionOrderSide(side);
    const price = selectPrice(priceObj, positionSide);

    let profitOrLoss = 0.0;
    if (price)
      profitOrLoss = calculateProfitLoss(
        price,
        side,
        quantity,
        initial_quantity,
        initial_filled_avg_price,
        profit_targets
      );

    const rowClassName = getRowClassName(profitOrLoss);

    return (
      <React.Fragment key={id}>
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

  const multiplierHeaders = profitMultipliers.map((profitMultiplier) => (
    <th>{profitMultiplier}x</th>
  ));

  return (
    <table className="table table-bordered align-middle text-center">
      <thead className="table-dark">
        <tr>
          <th>Symbol</th>
          <th>Side</th>
          <th>Entry</th>
          <th>Stop</th>
          <th>Price</th>
          {multiplierHeaders}
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
  openPositions: PropTypes.arrayOf(
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
  openPositions: [],
};
