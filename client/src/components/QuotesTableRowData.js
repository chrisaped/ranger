import { useState, useEffect } from "react";
import SpinnerButton from "./SpinnerButton";
import { 
  calculateProfitTarget,
  calculatePositionSize,
  calculateMoneyUpfront,
  calculateDefaultStopPrice,
  defaultStopPriceDifference
} from "../shared/calculations";
import { 
  createOrder, 
  cancelOrder,
  createBracketOrderObject
} from "../shared/orders";
import { displayPrice } from "../shared/formatting";

export default function QuotesTableRowData({ 
  socket, 
  symbol, 
  price, 
  removeFromWatchlist,
  deleteFromWatchlist,
  isForbiddenStopPrice,
  displayOrderButton,
  isDisabled
}) {
  const defaultStopPrice = 0;
  const [stopPrice, setStopPrice] = useState(defaultStopPrice);
  const [side, setSide] = useState('buy');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (price && (stopPrice === defaultStopPrice)) {
      const newDefaultStopPrice = price - defaultStopPriceDifference;
      setStopPrice(newDefaultStopPrice); 
    }

    socket.on(`${symbol} newOrderResponse`, (data) => {
      const orderId = data.order.id;
      setOrderId(orderId);
    });

    socket.on(`${symbol} fillOrderResponse`, (data) => {
      const orderId = data.order.id;
      setOrderId(orderId);
      removeFromWatchlist(symbol);
    });
  }, [price, removeFromWatchlist, socket, stopPrice, symbol]);

  const onSelectChange = (e) => {
    const newSide = e.target.value;
    setSide(newSide);
    const newDefaultStopPrice = calculateDefaultStopPrice(side, price);
    setStopPrice(newDefaultStopPrice);
  };

  const updateStopPrice = (e) => {
    const newStopPrice = e.target.value;
    setStopPrice(newStopPrice);
  };

  const stopPriceInputClassName = isForbiddenStopPrice(side, stopPrice, price) ?
    "form-control border border-danger" :
    "form-control";
  const profitTarget = calculateProfitTarget(price, stopPrice, side);
  const positionSize = calculatePositionSize(price, stopPrice);
  const moneyUpfront = calculateMoneyUpfront(price, stopPrice);
  const orderObject = createBracketOrderObject(symbol, side, positionSize, profitTarget, stopPrice);
  const createBracketOrder = () => createOrder(socket, orderObject);
  const cancelNewOrder = () => cancelOrder(socket, orderId);
  const currentPrice = displayPrice(price);
  const { buttonClass, buttonText } = displayOrderButton(side, symbol);
  const onClickRemove = () => deleteFromWatchlist(symbol);
  const isOrderButtonDisabled = isDisabled(side, stopPrice, currentPrice, symbol, positionSize);

  return (
    <>
      <td><strong>{symbol}</strong></td>
      {price ? (
        <>
          <td>
            <select 
              className="form-select"
              value={side}
              onChange={onSelectChange}
            >
              <option value="buy">Long</option>
              <option value="sell">Short</option>
            </select>
          </td>
          <td className="bg-warning"><strong>{currentPrice}</strong></td>
          <td className="bg-success text-white">{profitTarget}</td>
          <td>
            <input 
              className={stopPriceInputClassName}
              type="text"
              size="4"
              value={stopPrice} 
              onChange={updateStopPrice} 
            />         
          </td>
          <td>{positionSize} shares</td>
          <td>${moneyUpfront}</td>
          <td>
            <SpinnerButton 
              socket={socket}
              buttonClass={buttonClass}
              buttonText={buttonText}
              buttonDisabled={isOrderButtonDisabled}
              onClickFunction={createBracketOrder}
              orderId={orderId}
              symbol={symbol}
            />
          </td>       
        </>
      ):(
        <>
          <td className="bg-light" colSpan="7">
            Awaiting price data...
          </td>
        </>
      )}
      <td>
        {orderId ? (
          <SpinnerButton 
            socket={socket}
            buttonClass="btn btn-dark"
            buttonText='Cancel Order'
            onClickFunction={cancelNewOrder}
            orderId={orderId}
            symbol={symbol}
          />
        ):(
          <button 
            className="btn btn-secondary" 
            onClick={onClickRemove}
          >
            Remove
          </button>
        )}
      </td>    
    </>
  );
}
