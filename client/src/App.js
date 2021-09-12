import { useEffect, useState } from "react";
import { io } from 'socket.io-client';
import Search from './components/Search';
import SearchResult from "./components/SearchResult";
import Positions from "./components/Positions";
import Watchlist from "./components/Watchlist";

export default function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_ENDPOINT);
    setSocket(newSocket);
  
    return () => {
      newSocket.disconnect();
    }
  }, []);

  return (
    <>
    {socket ? (
    <div className="container">
      <div className="row">
        <Search socket={socket} />
      </div>
      <div className="row">
        <SearchResult socket={socket} />
      </div>
      <div className="row">
        <Positions socket={socket} />
      </div>      
      <div className="row">
        <Watchlist socket={socket} />
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
