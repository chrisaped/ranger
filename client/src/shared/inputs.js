export const updateNumberField = (value, updateFunction) => {
  const floatValue = parseFloat(value);
  updateFunction(floatValue);
};
