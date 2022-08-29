import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { sumObjectValues, calculateProfitLoss } from "../shared/calculations";
import { selectPrice } from "../shared/quotes";

export default function ProfitLoss({ positions, quotes, socket }) {
  const [totalProfitOrLossToday, setTotalProfitOrLossToday] = useState(0.0);

  useEffect(() => {
    socket.on("getTotalProfitOrLossTodayResponse", (data) => {
      setTotalProfitOrLossToday(data);
    });
  }, [socket]);

  const createCurrentPositions = (positions) => {
    const newObj = {};
    positions.forEach((positionObj) => {
      newObj[positionObj.symbol] = {
        shares: Math.abs(parseInt(positionObj.current_quantity)),
        entryPrice: parseFloat(positionObj.initial_filled_avg_price),
        side: positionObj.side,
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

  let profitLoss = currentPositionsProfitLoss + totalProfitOrLossToday || 0.0;
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
      <span className="p-2">Today's P/L:</span>
      <span className={badgeClass}>${profitLoss}</span>
    </div>
  );
}

ProfitLoss.propTypes = {
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
  positions: [],
  quotes: {},
};
