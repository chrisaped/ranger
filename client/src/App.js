import { useEffect, useState } from "react";
import { 
  initiateSocketConnection,
  disconnectSocket,
  connectToAlpaca
} from "./socket.io.service";

export default function App() {
  const [searchParams, setSearchParams] = useState('');
  // const [streamData, setStreamData] = useState({});

  // console.log('here is the streamData', streamData);

  useEffect(() => {
    initiateSocketConnection();
    return () => {
      disconnectSocket();
    }    
  }, []);

  const initiateAlpacaDataStream = () => {
    const arrayString = JSON.stringify([searchParams]);
    connectToAlpaca(arrayString);
  }

  return (
    <div>
      <div>
        <input type="text" placeholder="Symbol" value={searchParams} onChange={setSearchParams} />
        <button onClick={initiateAlpacaDataStream}>Search</button>
      </div>
      <div>
        {/* <p>{`${streamData}`}</p> */}
      </div>
    </div>
  );
}
