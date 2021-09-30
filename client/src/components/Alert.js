import { useState, useEffect } from "react";
import "../styles/alert.css";

export default function Alert({ socket }) {
  const [alert, setAlert] = useState('');
  const [displayAlert, setDisplayAlert] = useState(false);

  useEffect(() => {
    socket.on('newOrderUpdateResponse', (data) => {
      const symbol = data.order.symbol;
      const alertString = `${symbol} order initiated`;
      setAlert(alertString);
      setDisplayAlert(true);
    });

    socket.on("canceledOrderUpdateResponse", (data) => {
      handleOrderUpdateResponse(data);
    });

    socket.on("fillOrderUpdateResponse", (data) => {
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
    setAlert(alertString);
    setDisplayAlert(true);
  }

  return (
    <>
    {displayAlert && (
      <div class="position-fixed bottom-0 end-0 p-3" style={{ "z-index": 11 }}>
        <div id="liveToast" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true">
          <div className="d-flex">
            <div class="toast-body">
              {alert}
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
