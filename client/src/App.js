import { useEffect, useState } from "react";
import { io } from 'socket.io-client';
import Search from './components/Search';
import Positions from "./components/Positions";
import Watchlist from "./components/Watchlist";

export default function App() {
  const [socket, setSocket] = useState(null);
  const [quotes, setQuotes] = useState({});

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_ENDPOINT);
    setSocket(newSocket);

    newSocket.on("stockQuoteResponse", (quote) => {
      const { Symbol, AskPrice } = quote;
      setQuotesState(Symbol, AskPrice);
    });
  
    return () => {
      newSocket.disconnect();
    }
  }, []);

  const setQuotesState = (symbol, price) => {
    setQuotes((prevState) => ({ ...prevState, [symbol]: price }));
  };

  return (
    <>
    {socket ? (
    <div className="container">
      <div className="row">
        <Search socket={socket} />
      </div>
      <div className="row">
        <Watchlist 
          socket={socket}
          quotes={quotes}
        />
      </div>      
      <div className="row">
        <Positions socket={socket} />
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
