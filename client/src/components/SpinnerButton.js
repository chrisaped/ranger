import { useState, useEffect } from "react";

export default function SpinnerButton({
  socket,
  buttonClass, 
  buttonText, 
  buttonDisabled = false, 
  onClickFunction,
  orderId = ''
}) {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    socket.on("canceledOrderUpdateResponse", (data) => {
      const responseOrderId = data.order.id;
      if (orderId === responseOrderId) {
        setSubmitted(false);
      }
    });  
  }, [socket, orderId]);

  const handleOnClick = () => {
    setSubmitted(true);

    if (onClickFunction) {
      onClickFunction();
    }
  }

  return (
    <div className="text-center align-middle">
    {submitted ? (
      <button className={buttonClass} type="button" disabled>
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        {" "}Submitting...
      </button>
    ):(
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
