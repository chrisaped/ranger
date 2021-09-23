export const updateObjectState = (setState, key, value) => {
  setState((prevState) => ({ ...prevState, [key]: value }));
};
