import { useEffect, useState } from "react";
import { io } from 'socket.io-client';
import { updateObjectState } from "./shared/state";
import Search from './components/Search';
import ProfitLoss from "./components/ProfitLoss";
import Positions from "./components/Positions";
import Watchlist from "./components/Watchlist";
import Alert from "./components/Alert";

export default function App() {
  const [socket, setSocket] = useState(null);
  const [quotes, setQuotes] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  const [tradeableAssets, setTradeableAssets] = useState({});
  const [orders, setOrders] = useState([]);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_ENDPOINT);
    setSocket(newSocket);

    newSocket.on("stockQuoteResponse", (quote) => {
      const { Symbol, AskPrice } = quote;
      addQuote(Symbol, AskPrice);
    });

    // newSocket.on('getLatestQuoteResponse', (response) => {
    //   const symbol = response.symbol;
    //   const askPrice = response.last.askprice;
    //   addQuote(symbol, askPrice);
    // }); 

    newSocket.on('getAssetsResponse', (assets) => {
      setTradeableAssets(assets);
    });

    newSocket.on("getOrdersResponse", (array) => {
      setOrders(array);
    });

    newSocket.on("getPositionsResponse", (array) => {
      setPositions(array);
    });
  
    return () => {
      newSocket.disconnect();
    }
  }, []);

  const addQuote = (symbol, price) => {
    updateObjectState(setQuotes, symbol, price);
  };

  return (
    <>
    {socket ? (
    <div>
      <Alert socket={socket} />
      <div className="container">
        <div className="row">
          <div className="col"></div>
          <div className="col">
            <Search 
              socket={socket}
              watchlist={watchlist}
              setWatchlist={setWatchlist} 
              tradeableAssets={tradeableAssets}
            />
          </div>
          <div className="col d-flex justify-content-end align-items-center">
            {orders.length > 0 && (
              <ProfitLoss 
                orders={orders}
                positions={positions}
                quotes={quotes}
              />
            )}
          </div>
        </div>
        <div className="row">
          <Watchlist 
            socket={socket}
            quotes={quotes}
            setQuotes={setQuotes}
            watchlist={watchlist}
            setWatchlist={setWatchlist}
            tradeableAssets={tradeableAssets}
          />
        </div>      
        <div className="row">
          <Positions 
            socket={socket}
            quotes={quotes}
            orders={orders}
            positions={positions}
          />
        </div>      
      </div>
    </div>      
    ):(
      <div>
        <p>Socket connection error.</p>
      </div>
    )}
    </>
  );
}
