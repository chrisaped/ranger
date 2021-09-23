import { useEffect, useState } from "react";
import QuotesTable from "./QuotesTable";
import WatchlistList from "./WatchlistList";

export default function Watchlist({ socket, quotes, setQuotes, watchlist, setWatchlist }) {
  const [marketIsOpen, setMarketIsOpen] = useState(false);

  useEffect(() => {
    socket.on('getWatchlist', (symbols) => {
      setWatchlist(symbols);
    });

    socket.on('getClockResponse', (marketIsOpenBoolean) => {
      setMarketIsOpen(marketIsOpenBoolean);
    });

  }, [socket, setWatchlist]);

  const deleteFromWatchlist = (symbol) => {
    const newWatchlist = watchlist.filter(watchlistSymbol => watchlistSymbol !== symbol);
    setWatchlist(newWatchlist);
    if (Object.keys(quotes).length > 0) {
      const newQuotes = quotes;
      delete newQuotes[symbol];
      setQuotes(newQuotes);
    }
    socket.emit('deleteFromWatchlist', symbol);
  }

  const filteredQuotes = () => {
    const newQuotes = {};
    Object.entries(quotes).forEach(([symbol, price]) => {
      if (watchlist.includes(symbol)) {
        newQuotes[symbol] = price;
      }
    });
    return newQuotes;
  }

  const marketHoursReady = watchlist.length > 0 && marketIsOpen;
  const offMarketHoursReady = watchlist.length > 0 && !marketIsOpen;

  return (
    <div>
    {marketHoursReady && (
      <div>
        <QuotesTable 
          socket={socket}
          quotes={filteredQuotes()}
          deleteFromWatchlist={deleteFromWatchlist}
          watchlist={watchlist}
        />
      </div>
    )}
    {offMarketHoursReady && (
      <div className="d-flex justify-content-center m-3">
        <WatchlistList
          watchlist={watchlist} 
          deleteFromWatchlist={deleteFromWatchlist}
        />
      </div>
    )}
    {watchlist.length === 0 && (
      <div className="d-flex justify-content-center m-3">
        <p>The watchlist is empty.</p>
      </div>
    )}
    </div>
  );
}
