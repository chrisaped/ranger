import { useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function SpinnerButton({
  socket,
  buttonClass,
  buttonText,
  buttonDisabled = false,
  onClickFunction,
  orderId = "",
  symbol,
}) {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    socket.on("canceledOrderResponse", (data) => {
      const responseOrderId = data.order.id;
      if (orderId === responseOrderId) setSubmitted(false);
    });
  }, [socket, orderId]);

  const handleOnClick = () => {
    setSubmitted(true);
    onClickFunction();
  };

  return (
    <div className="text-center align-middle" id={symbol}>
      {submitted ? (
        <button className={buttonClass} type="button" disabled>
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
        </button>
      ) : (
        <button
          className={buttonClass}
          onClick={handleOnClick}
          disabled={buttonDisabled}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

SpinnerButton.propTypes = {
  socket: PropTypes.object.isRequired,
  buttonClass: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  buttonDisabled: PropTypes.bool,
  onClickFunction: PropTypes.func.isRequired,
  orderId: PropTypes.string,
  symbol: PropTypes.string.isRequired,
};

SpinnerButton.defaultProps = {
  socket: {},
  buttonClass: "",
  buttonText: "",
  buttonDisabled: false,
  orderId: "",
  symbol: "",
};
