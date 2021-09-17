export const displayPrice = (price) => {
  const priceFloat = parseFloat(price);
  return priceFloat.toFixed(2);
}

export const displayCost = (cost) => {
  const costFloat = parseFloat(cost);
  return Math.round(costFloat).toLocaleString();
}
