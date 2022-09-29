import PropTypes from "prop-types";
import QuotesTableRowData from "./QuotesTableRowData";
import { profitMultipliers } from "../shared/constants";

export default function QuotesTable({
  socket,
  quotes,
  removeFromQuotesAndWatchlist,
  watchlist,
  tradeableAssets,
  accountInfo,
  pendingPositions,
  newOrders,
}) {
  const lastMultiplier = profitMultipliers[profitMultipliers.length - 1];

  return (
    <table className="table table-bordered align-middle text-center">
      <thead className="table-dark">
        <tr>
          <th>Symbol</th>
          <th>Side</th>
          <th>Price</th>
          <th>Limit</th>
          <th>{lastMultiplier}x Target</th>
          <th>Stop</th>
          <th>Shares</th>
          <th>Cost</th>
          <th colSpan="2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {watchlist.map((symbol) => {
          const priceObj = quotes[symbol];
          const pendingPosition = pendingPositions[symbol];
          const newOrder = newOrders[symbol];

          return (
            <tr key={symbol}>
              <QuotesTableRowData
                socket={socket}
                symbol={symbol}
                priceObj={priceObj}
                removeFromQuotesAndWatchlist={removeFromQuotesAndWatchlist}
                tradeableAssets={tradeableAssets}
                accountInfo={accountInfo}
                lastMultiplier={lastMultiplier}
                pendingPosition={pendingPosition}
                newOrder={newOrder}
              />
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

QuotesTable.propTypes = {
  socket: PropTypes.object.isRequired,
  quotes: PropTypes.object.isRequired,
  removeFromQuotesAndWatchlist: PropTypes.func.isRequired,
  watchlist: PropTypes.arrayOf(PropTypes.string).isRequired,
  tradeableAssets: PropTypes.object.isRequired,
  accountInfo: PropTypes.object.isRequired,
};

QuotesTable.defaultProps = {
  socket: {},
  quotes: {},
  watchlist: [],
  tradeableAssets: {},
  accountInfo: {},
};
