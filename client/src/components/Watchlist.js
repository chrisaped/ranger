import { useEffect, useCallback } from "react";
import PropTypes from 'prop-types';
import QuotesTable from "./QuotesTable";

export default function Watchlist({ 
  socket, 
  quotes, 
  setQuotes, 
  watchlist, 
  setWatchlist,
  tradeableAssets,
  accountInfo
}) {
  useEffect(() => {
    socket.on('getWatchlist', (symbols) => {
      setWatchlist(symbols);
    });
  }, [socket, setWatchlist]);

  const removeFromQuotesAndWatchlist = useCallback((symbol) => {
    const newWatchlist = watchlist.filter(watchlistSymbol => watchlistSymbol !== symbol);
    setWatchlist(newWatchlist);
    if (Object.keys(quotes).length > 0) {
      const newQuotes = quotes;
      delete newQuotes[symbol];
      setQuotes(newQuotes);
    }
    socket.emit('removeFromQuotesAndWatchlist', symbol);
  }, [quotes, setQuotes, setWatchlist, socket, watchlist]);

  const removeFromWatchlist = useCallback(symbol => {
    if (watchlist.includes(symbol)) {
      const newWatchlist = watchlist.filter(watchlistSymbol => watchlistSymbol !== symbol);
      setWatchlist(newWatchlist);
      socket.emit('removeFromWatchlist', symbol);
    }
  }, [setWatchlist, socket, watchlist]);

  return (
    <div>
      {watchlist.length > 0 && (
        <QuotesTable 
          socket={socket}
          quotes={quotes}
          removeFromQuotesAndWatchlist={removeFromQuotesAndWatchlist}
          watchlist={watchlist}
          tradeableAssets={tradeableAssets}
          removeFromWatchlist={removeFromWatchlist}
          accountInfo={accountInfo}
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
  accountInfo: PropTypes.object.isRequired
};

Watchlist.defaultProps = {
  socket: {}, 
  quotes: {}, 
  watchlist: [], 
  tradeableAssets: {},
  accountInfo: {}
};
