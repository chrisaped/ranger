import PropTypes from 'prop-types';
import QuotesTableRowData from "./QuotesTableRowData";

export default function QuotesTable({ 
  socket, 
  quotes, 
  removeFromQuotesAndWatchlist,
  watchlist,
  tradeableAssets,
  removeFromWatchlist,
  accountInfo
}) {
  return (
    <table className="table table-bordered align-middle text-center">
      <thead className="table-dark">
        <tr>
          <th>Symbol</th>
          <th>Side</th>
          <th>Price</th>
          <th>Target</th>
          <th>Stop</th>
          <th>Shares</th>
          <th>Cost</th>
          <th>Indicators</th>
          <th colSpan="2">Actions</th>
        </tr>
      </thead>
      <tbody>
      {watchlist.map((symbol) => {
        const price = quotes[symbol];

        return (
          <tr key={symbol}>
            <QuotesTableRowData
              socket={socket}
              symbol={symbol} 
              price={price} 
              removeFromWatchlist={removeFromWatchlist}
              removeFromQuotesAndWatchlist={removeFromQuotesAndWatchlist}
              tradeableAssets={tradeableAssets}
              accountInfo={accountInfo}
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
  removeFromWatchlist: PropTypes.func.isRequired,
  accountInfo: PropTypes.object.isRequired
};

QuotesTable.defaultProps = {
  socket: {}, 
  quotes: {}, 
  watchlist: [],
  tradeableAssets: {},
  accountInfo: {}
};
