import { sumObjectValues } from "../shared/calculations";
import { extractTotalProfitLossFromClosedOrders } from "../shared/orders";

export default function ProfitLoss({ orders, positions, quotes }) {
  const currentPositionsSymbols = positions.map(positionObj => positionObj.symbol);
  const currentPositionsWithQuotes = currentPositionsSymbols.reduce((ac, symbol) => (
    {...ac,[symbol]: quotes[symbol]}
  ),{});
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
