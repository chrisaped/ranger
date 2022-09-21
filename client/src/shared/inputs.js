export const updateNumberField = (value, updateFunction) => {
  if (!isNaN(value)) {
    const valueWithTwoDecimals = parseFloat(value).toFixed(2);
    updateFunction(parseFloat(valueWithTwoDecimals));
  }
};
