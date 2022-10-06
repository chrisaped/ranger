import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { sumObjectValues, calculateProfitLoss } from "../shared/calculations";
import { selectPrice } from "../shared/quotes";
import { displayCurrency } from "../shared/formatting";
import { determinePositionOrderSide } from "../shared/orders";

export default function ProfitLoss({ openPositions, quotes, socket }) {
  const [totalProfitOrLossToday, setTotalProfitOrLossToday] = useState(0.0);

  useEffect(() => {
    socket.on("getTotalProfitOrLossTodayResponse", (data) => {
      setTotalProfitOrLossToday(parseFloat(data));
    });
  }, [socket]);

  const createCurrentPositions = () => {
    const newObj = {};

    openPositions.forEach((positionObj) => {
      const {
        symbol,
        side,
        current_quantity,
        initial_quantity,
        initial_filled_avg_price,
        profit_targets,
      } = positionObj;

      const priceObj = quotes[symbol];
      const positionSide = determinePositionOrderSide(side);
      const price = selectPrice(priceObj, positionSide);

      const calculatedProfitLoss = calculateProfitLoss(
        price,
        side,
        current_quantity,
        initial_quantity,
        initial_filled_avg_price,
        profit_targets
      );

      newObj[symbol] = calculatedProfitLoss;
    });

    return newObj;
  };

  const currentPositions = createCurrentPositions();

  let currentPositionsProfitLoss = 0.0;
  if (Object.keys(currentPositions).length > 0) {
    currentPositionsProfitLoss = sumObjectValues(currentPositions);
  }

  const profitLoss = currentPositionsProfitLoss + totalProfitOrLossToday || 0.0;

  let badgeClass;
  if (profitLoss < 0) {
    badgeClass = "badge bg-danger fs-6 text";
  } else if (profitLoss === 0) {
    badgeClass = "badge bg-secondary fs-6 text";
  } else {
    badgeClass = "badge bg-success fs-6 text";
  }

  return (
    <div>
      <span className="p-2">Today's P/L:</span>
      <span className={badgeClass}>${displayCurrency(profitLoss)}</span>
    </div>
  );
}

ProfitLoss.propTypes = {
  openPositions: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string,
      side: PropTypes.string,
      current_quantity: PropTypes.number,
      initial_quantity: PropTypes.number,
      initial_filled_avg_price: PropTypes.number,
      profit_targets: PropTypes.array,
    })
  ).isRequired,
  quotes: PropTypes.object.isRequired,
};

ProfitLoss.defaultProps = {
  openPositions: [],
  quotes: {},
};
