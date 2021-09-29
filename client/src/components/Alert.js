import { useState, useEffect } from "react";
import "../styles/alert.css";

export default function Alert({ socket }) {
  const [alert, setAlert] = useState('');
  const [displayAlert, setDisplayAlert] = useState(false);

  useEffect(() => {
    socket.on("orderUpdateResponse", (data) => {
      const orderEvent = data.event;
      if (['fill', 'canceled'].includes(orderEvent)) {
        const symbol = data.order.symbol;
        const status = data.order.status;
        const alertString = `${symbol} order ${status}`;
        setAlert(alertString);
        setDisplayAlert(true);
      }
    });

    const timer = setTimeout(() => {
      setDisplayAlert(false);
    }, 5000)

    return () => {
      clearTimeout(timer);
    }
  }, [socket, alert]);

  return (
    <div className={displayAlert ? 'fadeIn' : 'fadeOut'}>
      <div className="alert alert-primary fade show text-center" role="alert">
        {alert}
      </div>
    </div>
  );
}
