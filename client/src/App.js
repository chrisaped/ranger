import { useEffect, useState } from "react";
import { io } from 'socket.io-client';
import Search from './components/Search';
import SearchResult from "./components/SearchResult";

export default function App() {
  const [socket, setSocket] = useState(null);
  const [quote, setQuote] = useState({});

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_ENDPOINT);
    setSocket(newSocket);

    const onStockQuote = (cb) => {
      newSocket.on('stockQuoteResponse', data => {
        return cb(null, data);
      });
    }

    onStockQuote((_err, data) => {
      setQuote(data);
    });
  
    return () => {
      newSocket.disconnect();
    }
  }, []);

  const sampleQuote = {
    Symbol: 'GME',
    AskPrice: 250.12
  };

  return (
    <div className="container">
      <div className="row">
        <Search socket={socket} />
      </div>
      {/* {Object.keys(quote).length > 0 && ( */}
      <div className="row">
        <SearchResult quote={sampleQuote} />
      </div>
      {/* )} */}
    </div>
  );
}
