export const updateNumberField = (value, updateFunction) => {
  if (!isNaN(value)) {
    updateFunction(value);
  }
};
