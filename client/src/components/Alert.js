import { useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import "../styles/alert.scss";

export default function Alert({ socket }) {
  const [alert, setAlert] = useState('');

  useEffect(() => {
    socket.on("orderUpdateResponse", (data) => {
      const orderEvent = data.event;
      if (['fill', 'canceled'].includes(orderEvent)) {
        const symbol = data.order.symbol;
        const status = data.order.status;
        const alertString = `${symbol} order ${status}`;
        setAlert(alertString);
      }
    });

    const timer = setTimeout(() => {
      setAlert('');
    }, 5000)

    return () => {
      clearTimeout(timer)
    }
  }, [socket, alert]);

  return (
    <>
      <CSSTransition in={alert !== ''} timeout={300} classNames="alert">
        <div className="alert alert-primary fade show text-center" role="alert">
          {alert}
        </div>
      </CSSTransition>
    </>
  );
}
