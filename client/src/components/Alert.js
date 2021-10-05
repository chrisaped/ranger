import { useEffect, useCallback } from "react";
import PropTypes from 'prop-types';
import { enableAlert } from "../shared/formatting";
import "../styles/alert.css";

export default function Alert({ 
  socket,
  alert,
  setAlert,
  displayAlert,
  setDisplayAlert
}) {
  const handleOrderUpdateResponse = useCallback((data) => {
    const symbol = data.order.symbol;
    const status = data.order.status;
    const alertString = `${symbol} order ${status}`;
    enableAlert(alertString, setAlert, setDisplayAlert);
  }, [setAlert, setDisplayAlert]);

  useEffect(() => {
    socket.on('newOrderResponse', (data) => {
      const symbol = data.order.symbol;
      const alertString = `${symbol} order initiated`;
      enableAlert(alertString, setAlert, setDisplayAlert);
    });

    socket.on("canceledOrderResponse", (data) => {
      handleOrderUpdateResponse(data);
    });

    socket.on("fillOrderResponse", (data) => {
      handleOrderUpdateResponse(data);
    });

    socket.on("errorResponse", (message) => {
      enableAlert(message, setAlert, setDisplayAlert, true);
    });
  }, [socket, handleOrderUpdateResponse, setAlert, setDisplayAlert]);

  let alertBackground = 'bg-primary';
  if (alert.error === true) {
    alertBackground = 'bg-danger';
  }

  return (
    <div className={displayAlert ? 'fadeIn' : 'fadeOut'}>
      <div className="align-middle text-center">
        <div className={`${alertBackground} text-white p-2 mt-2`}>
          <strong>{alert.message}</strong>
        </div>
      </div>
    </div>
  );
}

Alert.propTypes = {
  socket: PropTypes.object.isRequired,
  alert: PropTypes.object.isRequired,
  setAlert: PropTypes.func.isRequired,
  displayAlert: PropTypes.bool.isRequired,
  setDisplayAlert: PropTypes.func.isRequired
};

Alert.defaultProps = {
  socket: {},
  alert: {},
  displayAlert: false
};
