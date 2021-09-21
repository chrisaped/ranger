import { useState } from "react";

export default function SpinnerButton({buttonClass, buttonText, buttonDisabled, onClickFunction}) {
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
        className={buttonClass} 
        onClick={handleOnClick}
        disabled={buttonDisabled}
      >
        {buttonText}
      </button>
    )}
    </>
  );
}
