import { useEffect, useState } from "react";
import { io } from 'socket.io-client';
import { updateObjectState } from "./shared/state";
import Search from './components/Search';
import ProfitLoss from "./components/ProfitLoss";
import Positions from "./components/Positions";
import Watchlist from "./components/Watchlist";

export default function App() {
  const [socket, setSocket] = useState(null);
  const [quotes, setQuotes] = useState({});
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_ENDPOINT);
    setSocket(newSocket);

    newSocket.on("stockQuoteResponse", (quote) => {
      const { Symbol, AskPrice } = quote;
      addQuote(Symbol, AskPrice);
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
    <div className="container">
      <div className="row">
        <div class="col"></div>
        <div class="col">
          <Search 
            socket={socket}
            watchlist={watchlist}
            setWatchlist={setWatchlist} 
          />
        </div>
        <div class="col d-flex justify-content-end align-items-center">
          <ProfitLoss socket={socket} />
        </div>
      </div>
      <div className="row">
        <Watchlist 
          socket={socket}
          quotes={quotes}
          setQuotes={setQuotes}
          watchlist={watchlist}
          setWatchlist={setWatchlist}
        />
      </div>      
      <div className="row">
        <Positions 
          socket={socket}
          quotes={quotes}
        />
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
