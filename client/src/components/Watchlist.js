import { useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import QuotesTable from "./QuotesTable";

export default function Watchlist({
  socket,
  quotes,
  setQuotes,
  watchlist,
  setWatchlist,
  tradeableAssets,
  accountInfo,
  pendingPositions,
  newOrders,
}) {
  useEffect(() => {
    socket.on("getWatchlist", (symbols) => setWatchlist(symbols));
  }, []); // eslint-disable-line

  const removeFromQuotesAndWatchlist = useCallback(
    (symbol) => {
      socket.emit("removeFromQuotesAndWatchlist", symbol);

      if (Object.keys(quotes).length > 0) {
        const newQuotes = quotes;
        delete newQuotes[symbol];
        setQuotes(newQuotes);
      }
    },
    [watchlist] // eslint-disable-line
  );

  return (
    <div>
      {watchlist.length > 0 && (
        <QuotesTable
          socket={socket}
          quotes={quotes}
          removeFromQuotesAndWatchlist={removeFromQuotesAndWatchlist}
          watchlist={watchlist}
          tradeableAssets={tradeableAssets}
          accountInfo={accountInfo}
          pendingPositions={pendingPositions}
          newOrders={newOrders}
        />
      )}
    </div>
  );
}

Watchlist.propTypes = {
  socket: PropTypes.object.isRequired,
  quotes: PropTypes.object.isRequired,
  setQuotes: PropTypes.func.isRequired,
  watchlist: PropTypes.arrayOf(PropTypes.string).isRequired,
  setWatchlist: PropTypes.func.isRequired,
  tradeableAssets: PropTypes.object.isRequired,
  accountInfo: PropTypes.object.isRequired,
};

Watchlist.defaultProps = {
  socket: {},
  quotes: {},
  watchlist: [],
  tradeableAssets: {},
  accountInfo: {},
};
