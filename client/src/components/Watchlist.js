import { useEffect, useState } from "react";

export default function Watchlist({ socket, quotes, searchSymbol }) {
  const [watchlist, setWatchlist] = useState({});

  const watchlistIsReady = (Object.keys(quotes).length > 0) && searchSymbol;

  useEffect(() => {
    socket.emit('getWatchlist');

    if (watchlistIsReady) {
      const { searchSymbol, ...newQuotes } = quotes;
      setWatchlist(newQuotes);
    }

  }, [socket, watchlistIsReady, quotes]);

  return (
    <div>
      <h2>Watchlist</h2>
      {Object.keys(watchlist).length > 0 ? (
        <div>
          <p>{`${watchlist}`}</p>
        </div>
      ):(
        <div>
          <p>The watchlist is empty.</p>
        </div>
      )}
    </div>
  );
}
