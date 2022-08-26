import PropTypes from "prop-types";
import { sumObjectValues, calculateProfitLoss } from "../shared/calculations";
import { extractTotalProfitLossFromClosedOrders } from "../shared/orders";
import { selectPrice } from "../shared/quotes";

export default function ProfitLoss({ orders, positions, quotes }) {
  const createCurrentPositions = (positions) => {
    const newObj = {};
    positions.forEach((positionObj) => {
      newObj[positionObj.symbol] = {
        shares: Math.abs(parseInt(positionObj.qty)),
        entryPrice: parseFloat(positionObj.avg_entry_price),
        side: positionObj.side,
        currentPrice: positionObj.current_price,
        grossEarnings: positionObj.gross_earnings,
      };
    });
    return newObj;
  };
  const currentPositions = createCurrentPositions(positions);
  const createCurrentPositionsWithQuotes = (quotes) => {
    const newObj = {};
    Object.entries(currentPositions).forEach(([symbol, infoObj]) => {
      const priceObj = quotes[symbol];
      const side = infoObj.side;
      let price = selectPrice(priceObj, side);
      if (!price) {
        price = parseFloat(infoObj.currentPrice);
      }
      const calculatedProfitLoss = calculateProfitLoss(
        price,
        infoObj.entryPrice,
        infoObj.shares,
        infoObj.side,
        infoObj.grossEarnings
      );
      newObj[symbol] = parseFloat(calculatedProfitLoss);
    });
    return newObj;
  };
  const currentPositionsWithQuotes = createCurrentPositionsWithQuotes(quotes);
  let currentPositionsProfitLoss = 0;
  if (Object.keys(currentPositionsWithQuotes).length > 0) {
    currentPositionsProfitLoss = sumObjectValues(currentPositionsWithQuotes);
  }
  const closedPositionsProfitLoss =
    extractTotalProfitLossFromClosedOrders(orders);
  let profitLoss = currentPositionsProfitLoss + closedPositionsProfitLoss;
  let badgeClass;
  if (profitLoss < 0) {
    badgeClass = "badge bg-danger fs-6 text";
  } else if (profitLoss === 0) {
    badgeClass = "badge bg-secondary fs-6 text";
  } else {
    badgeClass = "badge bg-success fs-6 text";
  }

  if (!isNaN(profitLoss)) {
    profitLoss = profitLoss.toFixed(2);
  }

  return (
    <div>
      {/* <span className="p-2"><strong>Daily P/L:</strong></span> */}
      <span className={badgeClass}>{profitLoss}</span>
    </div>
  );
}

ProfitLoss.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string,
      legs: PropTypes.arrayOf(PropTypes.object),
      symbol: PropTypes.string,
      side: PropTypes.string,
      filled_qty: PropTypes.string,
      filled_avg_price: PropTypes.string,
    })
  ).isRequired,
  positions: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string,
      qty: PropTypes.string,
      avg_entry_price: PropTypes.string,
      side: PropTypes.string,
    })
  ).isRequired,
  quotes: PropTypes.object.isRequired,
};

ProfitLoss.defaultProps = {
  orders: [],
  positions: [],
  quotes: {},
};
