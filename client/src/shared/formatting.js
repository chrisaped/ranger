export const displayPrice = (price) => {
  if (isNaN(price)) return "N/A";
  return price.toFixed(2);
};

export const displayCost = (cost) => Math.round(cost);

const displayAlertTimeout = (setDisplayAlert) => {
  setTimeout(() => {
    setDisplayAlert(false);
  }, 5000);
};

export const enableAlert = (
  alertString,
  setAlert,
  setDisplayAlert,
  error = false
) => {
  const alertObj = { message: alertString, error: error };
  setAlert(alertObj);
  setDisplayAlert(true);
  displayAlertTimeout(setDisplayAlert);
};

export const capitalizeString = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);
