import { useEffect, useState } from "react";
import QuotesTable from "./QuotesTable";
import WatchlistList from "./WatchlistList";

export default function Watchlist({ socket, quotes, setQuotes, watchlist, setWatchlist }) {
  const [stopPrices, setStopPrices] = useState({});
  const [marketIsOpen, setMarketIsOpen] = useState(false);
  const defaultStopPriceDifference = .25;

  useEffect(() => {
    socket.on('getWatchlist', (symbols) => {
      setWatchlist(symbols);
    });

    socket.on('getClockResponse', (marketIsOpenBoolean) => {
      setMarketIsOpen(marketIsOpenBoolean);
    });

    if (Object.keys(quotes).length > 0) {
      const stopPricesLength = Object.keys(stopPrices).length;
      const newStopPrices = stopPrices;
      Object.entries(quotes).forEach(([symbol, price]) => {
        if (!(symbol in newStopPrices) && watchlist.includes(symbol)) {
          const stopPrice = (price - defaultStopPriceDifference).toFixed(2);
          newStopPrices[symbol] = stopPrice;
        }
      });
      const newStopPricesLength = Object.keys(newStopPrices).length;
      if (newStopPricesLength > stopPricesLength) {
        setStopPrices(newStopPrices);
      }
    }
  }, [socket, quotes, setQuotes, stopPrices, watchlist, setWatchlist]);

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

  const onStopPriceChange = (symbol, newStopPrice) => {
    setStopPrices((prevState) => ({ ...prevState, [symbol]: newStopPrice }));
  };

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
          stopPrices={stopPrices}
          onStopPriceChange={onStopPriceChange}
          deleteFromWatchlist={deleteFromWatchlist}
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
