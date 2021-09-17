import { useEffect, useState } from "react";
import QuotesTable from "./QuotesTable";

export default function Watchlist({ socket, quotes, setQuotes }) {
  const [stopPrices, setStopPrices] = useState({});
  const defaultStopPriceDifference = .25;

  useEffect(() => {
    socket.on("deleteFromWatchlist", (symbol) => {
      const newQuotes = quotes;
      delete newQuotes[symbol];
      setQuotes(newQuotes);
    });

    if (Object.keys(quotes).length > 0) {
      const stopPricesLength = Object.keys(stopPrices).length;
      const newStopPrices = stopPrices;
      Object.entries(quotes).forEach(([symbol, price]) => {
        if (!(symbol in newStopPrices)) {
          newStopPrices[symbol] = (price - defaultStopPriceDifference);
        }
      });
      const newStopPricesLength = Object.keys(newStopPrices).length;
      if (newStopPricesLength > stopPricesLength) {
        setStopPrices(newStopPrices);
      }
    }
  }, [socket, quotes, setQuotes, stopPrices]);

  const onStopPriceChange = (symbol, newStopPrice) => {
    setStopPrices((prevState) => ({ ...prevState, [symbol]: newStopPrice }));
  };

  const displayReady = (Object.keys(quotes).length > 0) 
  && (Object.keys(stopPrices).length > 0);

  return (
    <div>
      {displayReady ? (
        <div>
          <QuotesTable 
            socket={socket}
            quotes={quotes}
            stopPrices={stopPrices}
            onStopPriceChange={onStopPriceChange}
          />
        </div>
      ):(
        <div>
          <p>The watchlist is empty.</p>
        </div>
      )}
    </div>
  );
}
