import PropTypes from 'prop-types';
import QuotesTableRowData from "./QuotesTableRowData";

export default function QuotesTable({ 
  socket, 
  quotes, 
  removeFromQuotesAndWatchlist,
  watchlist,
  tradeableAssets,
  removeFromWatchlist
}) {
  const displayOrderButton = (side, symbol) => {
    let buttonText = 'Long';
    let buttonClass = "btn btn-success";

    if (side === 'sell') {
      buttonText = 'Short';
      buttonClass = "btn btn-danger";
      if (!isShortable(symbol)) {
        buttonText = 'Not Shortable'
      }
    }

    return { buttonText, buttonClass };
  }

  const isForbiddenStopPrice = (side, stopPrice, price) => {
    if ((side === 'buy') && (stopPrice > price)) {
      return true;
    }
    if ((side === 'sell') && (stopPrice < price)) {
      return true;
    }
    return false;    
  };

  const isShortable = (symbol) => {
    const assetsObject = tradeableAssets[symbol];
    return assetsObject?.shortable;
  };

  const isProperPositionSize = (positionSize) => {
    if (positionSize === 0) {
      return false;
    }
    return true;
  };

  const isDisabled = (side, stopPrice, currentPrice, symbol, positionSize) => {
    if (side === 'sell') {
      if (
        isForbiddenStopPrice(side, stopPrice, currentPrice) || 
        !isShortable(symbol) ||
        !isProperPositionSize(positionSize)
      ) {
        return true;
      }
    }

    if (side === 'buy') {
      if (
        isForbiddenStopPrice(side, stopPrice, currentPrice) ||
        !isProperPositionSize(positionSize)
      ) {
        return true;
      }
    }

    return false;
  };

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
              isForbiddenStopPrice={isForbiddenStopPrice}
              displayOrderButton={displayOrderButton}
              isDisabled={isDisabled}
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
  removeFromWatchlist: PropTypes.func.isRequired
};

QuotesTable.defaultProps = {
  socket: {}, 
  quotes: {}, 
  watchlist: [],
  tradeableAssets: {}
};
