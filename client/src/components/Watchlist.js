import { useEffect, useState } from "react";
import QuotesTable from "./QuotesTable";

export default function Watchlist({ socket, quotes }) {
  const [stopPrices, setStopPrices] = useState({});

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
