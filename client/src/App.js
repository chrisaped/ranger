import { useEffect } from "react";
import { 
  initiateSocketConnection,
  disconnectSocket
} from "./socket.io.service";

export default function App() {
  useEffect(() => {
    initiateSocketConnection();
    return () => {
      disconnectSocket();
    }    
  }, []);

  async function callAlpacaDataStream() {
    const response = await fetch('/alpaca_data_stream', { method: 'POST' });
    console.log('here is the response', response);
  }

  return (
    <div>
      <button onClick={callAlpacaDataStream}>Submit</button>
    </div>
  );
}
