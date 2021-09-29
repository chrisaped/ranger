import { useEffect } from "react";
import QuotesTable from "./QuotesTable";

export default function Watchlist({ 
  socket, 
  quotes, 
  setQuotes, 
  watchlist, 
  setWatchlist,
  tradeableAssets
}) {
  useEffect(() => {
    socket.on('getWatchlist', (symbols) => {
      setWatchlist(symbols);
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

  return (
    <div>
      <QuotesTable 
        socket={socket}
        quotes={filteredQuotes()}
        deleteFromWatchlist={deleteFromWatchlist}
        watchlist={watchlist}
        tradeableAssets={tradeableAssets}
      />
    </div>
  );
}
