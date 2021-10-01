export const displayPrice = (price) => {
  if (isNaN(price)) {
    return 'N/A';
  }
  const priceFloat = parseFloat(price);
  return priceFloat.toFixed(2);
}

export const displayCost = (cost) => {
  const costFloat = parseFloat(cost);
  return Math.round(costFloat).toLocaleString();
}
