import { useEffect, useState } from "react";
import QuotesTable from "./QuotesTable";

export default function Watchlist({ socket, quotes, setQuotes }) {
  const [stopPrices, setStopPrices] = useState({});

  useEffect(() => {
    socket.on("deleteFromWatchlist", (symbol) => {
      const newQuotes = quotes;
      delete newQuotes[symbol];
      setQuotes(newQuotes);
    });
  }, [socket, quotes, setQuotes]);

  const displayReady = (Object.keys(quotes).length > 0) 
    && (Object.keys(stopPrices).length > 0);
  const defaultStopPriceDifference = .25;

  const createStopPricesObj = (quotes) => {
    const stopPricesObj = {};
    Object.entries(quotes).forEach(([symbol, price]) => {
      stopPricesObj[symbol] = (price - defaultStopPriceDifference);
    });
    return stopPricesObj;
  };

  const onStopPriceChange = (symbol, newStopPrice) => {
    setStopPrices((prevState) => ({ ...prevState, [symbol]: newStopPrice }));
  };

  useEffect(() => {
    if (Object.keys(quotes).length > 0) {
      const stopPricesObj = createStopPricesObj(quotes);
      setStopPrices(stopPricesObj);
    }
  }, [quotes]);  


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
