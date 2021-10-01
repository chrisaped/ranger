import { useState, useEffect } from "react";
import "../styles/alert.css";

export default function Alert({ socket }) {
  const [alert, setAlert] = useState('');
  const [displayAlert, setDisplayAlert] = useState(false);

  useEffect(() => {
    socket.on('newOrderResponse', (data) => {
      const symbol = data.order.symbol;
      const alertString = `${symbol} order initiated`;
      console.log('here is the alertString', alertString);
      setAlert(alertString);
      setDisplayAlert(true);
    });

    socket.on("canceledOrderResponse", (data) => {
      handleOrderUpdateResponse(data);
    });

    socket.on("fillOrderResponse", (data) => {
      handleOrderUpdateResponse(data);
    });    

    const timer = setTimeout(() => {
      setDisplayAlert(false);
    }, 5000)

    return () => {
      clearTimeout(timer);
    }
  }, [socket, alert]);

  const handleOrderUpdateResponse = (data) => {
    const symbol = data.order.symbol;
    const status = data.order.status;
    const alertString = `${symbol} order ${status}`;
    console.log('here is the alertString', alertString);
    setAlert(alertString);
    setDisplayAlert(true);
  }

  return (
    <>
    {displayAlert && (
      <div>
        <strong>{alert}</strong>
      </div>
    )}
    </>
  );
}
