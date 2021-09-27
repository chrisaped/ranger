import { sumObjectValues, calculateProfitLoss } from "../shared/calculations";
import { extractTotalProfitLossFromClosedOrders } from "../shared/orders";

export default function ProfitLoss({ orders, positions, quotes }) {
  const createCurrentPositions = (positions) => {
    const newObj = {};
    positions.forEach(positionObj => {
      newObj[positionObj.symbol] = { 
        shares: positionObj.qty, 
        entryPrice: positionObj.avg_entry_price,
        side: positionObj.side
      };
    })
    return newObj;
  };
  const currentPositions = createCurrentPositions(positions);
  const createCurrentPositionsWithQuotes = (quotes) => {
    const newObj = {};
    Object.entries(currentPositions).forEach(([symbol, infoObj]) => {
      newObj[symbol] = calculateProfitLoss(quotes[symbol], infoObj.entryPrice, infoObj.shares, infoObj.side);
    })
    return newObj;
  };
  const currentPositionsWithQuotes = createCurrentPositionsWithQuotes(quotes);
  const currentPositionsProfitLoss = sumObjectValues(currentPositionsWithQuotes);
  const closedPositionsProfitLoss = extractTotalProfitLossFromClosedOrders(orders);
  const profitLoss = currentPositionsProfitLoss + closedPositionsProfitLoss;

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
      <span className="p-2"><strong>Daily P/L:</strong></span>
      <span className={badgeClass}>{profitLoss}</span>
    </div>
  );
}
