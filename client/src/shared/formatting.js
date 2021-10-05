export const displayPrice = (price) => {
  if (isNaN(price)) {
    return 'N/A';
  }
  const priceFloat = parseFloat(price);
  return priceFloat.toFixed(2);
};

export const displayCost = (cost) => {
  const costFloat = parseFloat(cost);
  return Math.round(costFloat).toLocaleString();
};

const displayAlertTimeout = (setDisplayAlert) => {
  setTimeout(() => {
    setDisplayAlert(false);
  }, 5000);
};

export const enableAlert = (alertString, setAlert, setDisplayAlert, error = false) => {
  const alertObj = { message: alertString, error: error };
  setAlert(alertObj);
  setDisplayAlert(true);
  displayAlertTimeout(setDisplayAlert);
};
