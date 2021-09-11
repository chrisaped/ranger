import { useEffect, useState } from "react";
import { io } from 'socket.io-client';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [searchParams, setSearchParams] = useState('');
  const [quoteData, setQuoteData] = useState({});

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_ENDPOINT);
    setSocket(newSocket);

    const onStockQuote = (cb) => {
      newSocket.on('stockQuoteResponse', data => {
        return cb(null, data);
      });
    }

    onStockQuote((_err, data) => {
      setQuoteData(data);
    });
    return () => {
      newSocket.disconnect();
    }
  }, []);

  const getStockQuote = () => {
    socket.emit('getStockQuote', searchParams);
  }

  return (
    <div>
      <div>
        <input 
          type="text" 
          placeholder="Symbol" 
          value={searchParams} 
          onChange={(e) => setSearchParams(e.target.value)} 
        />
        <button onClick={getStockQuote}>Search</button>
      </div>
      <div>
        <p>{`${quoteData?.Symbol}: ${quoteData?.AskPrice}`}</p>
      </div>
    </div>
  );
}
