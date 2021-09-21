import { useState } from "react";

export default function SpinnerButton({buttonText, onClickFunction}) {
  const [submitted, setSubmitted] = useState(false);

  const handleOnClick = () => {
    setSubmitted(true);

    if (onClickFunction) {
      onClickFunction();
    }
  }

  return (
    <>
    {submitted ? (
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    ):(
      <button 
        className="btn btn-dark m-2" 
        onClick={handleOnClick}
      >
        {buttonText}
      </button>
    )}
    </>
  );
}
