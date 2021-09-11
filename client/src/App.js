import { useEffect, useState } from "react";
import { io } from 'socket.io-client';
import Search from './components/Search';

export default function App() {
  const [socket, setSocket] = useState(null);
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

  return (
    <div className="container d-flex justify-content-center">
      <Search socket={socket} quoteData={quoteData} />
    </div>
  );
}
