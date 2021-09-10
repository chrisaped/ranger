import { useEffect, useState } from "react";
import { io } from 'socket.io-client';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [searchParams, setSearchParams] = useState('');
  const [streamData, setStreamData] = useState({});

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_ENDPOINT);
    setSocket(newSocket);

    const subscribeToChat = (cb) => {
      newSocket.on('my broadcast', msg => {
        return cb(null, msg);
      });
    }

    subscribeToChat((err, data) => {
      setStreamData(data);
      console.log('here is the datta', data);
    });
    return () => {
      newSocket.disconnect();
    }    
  }, [setSocket]);

  const initiateAlpacaDataStream = () => {
    const arrayString = JSON.stringify([searchParams]);
    socket.emit('my message', arrayString);
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
        <button onClick={initiateAlpacaDataStream}>Search</button>
      </div>
      <div>
        <p>{`${searchParams}`}</p>
        <p>{`${streamData?.Symbol}: ${streamData?.AskPrice}`}</p>
      </div>
    </div>
  );
}
