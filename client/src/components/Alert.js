import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import "../styles/alert.css";

export default function Alert({ socket }) {
  const [alert, setAlert] = useState('');
  const [displayAlert, setDisplayAlert] = useState(false);

  useEffect(() => {
    socket.on('newOrderResponse', (data) => {
      const symbol = data.order.symbol;
      const alertString = `${symbol} order initiated`;
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
    setAlert(alertString);
    setDisplayAlert(true);
  }

  return (
    <div className={displayAlert ? 'fadeIn' : 'fadeOut'}>
      <div className="align-middle text-center">
        <div className="bg-primary text-white p-2 mt-2">
          <strong>{alert}</strong>
        </div>
      </div>
    </div>
  );
}

Alert.propTypes = {
  socket: PropTypes.object.isRequired,
}

Alert.defaultProps = {
  socket: {}
}
