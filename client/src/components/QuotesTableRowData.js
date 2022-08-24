import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SpinnerButton from "./SpinnerButton";
import {
  calculatePositionSize,
  calculateMoneyUpfront,
  calculateDefaultStopPrice,
  calculate1xProfitTarget,
} from "../shared/calculations";
import {
  createNewOrder,
  cancelOrder,
  createLimitOrderWithStop,
} from "../shared/orders";
import { updateNumberField } from "../shared/inputs";
import { displayPrice } from "../shared/formatting";
import { defaultStopPriceDifference } from "../shared/constants";
import {
  displayOrderButton,
  isForbiddenStopPrice,
  isDisabled,
  selectPrice,
} from "../shared/quotes";

export default function QuotesTableRowData({
  socket,
  symbol,
  priceObj,
  removeFromWatchlist,
  removeFromQuotesAndWatchlist,
  tradeableAssets,
  accountInfo,
}) {
  const defaultStopPrice = 0;
  const defaultLimitPrice = 0;
  const [stopPrice, setStopPrice] = useState(defaultStopPrice);
  const [limitPrice, setLimitPrice] = useState(defaultLimitPrice);
  const [side, setSide] = useState("buy");
  const [orderId, setOrderId] = useState("");

  const price = selectPrice(priceObj, side);

  useEffect(() => {
    socket.on(`${symbol} newOrderResponse`, (data) => {
      const newOrderId = data.order.id;
      setOrderId(newOrderId);
    });

    socket.on(`${symbol} fillOrderResponse`, (data) => {
      const newOrderId = data.order.id;
      setOrderId(newOrderId);
      removeFromWatchlist(symbol);
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (price && stopPrice === defaultStopPrice) {
      const newDefaultStopPrice = price - defaultStopPriceDifference;
      setStopPrice(newDefaultStopPrice);
    }
  }, [price, stopPrice]);

  useEffect(() => {
    if (price && limitPrice === defaultLimitPrice) {
      setLimitPrice(price);
    }
  }, [price, limitPrice]);

  const onSelectChange = (e) => {
    const newSide = e.target.value;
    setSide(newSide);
    const newDefaultStopPrice = calculateDefaultStopPrice(side, limitPrice);
    setStopPrice(newDefaultStopPrice);
  };

  const stopPriceInputClassName = isForbiddenStopPrice(
    side,
    stopPrice,
    limitPrice
  )
    ? "form-control border border-danger"
    : "form-control";
  const accountSize = accountInfo.buying_power;
  const positionSize = calculatePositionSize(
    limitPrice,
    stopPrice,
    accountSize
  );
  const profitTarget = calculate1xProfitTarget(limitPrice, stopPrice, side);
  const positionSizeDisplay = positionSize.toLocaleString();
  const moneyUpfront = calculateMoneyUpfront(
    limitPrice,
    stopPrice,
    accountSize
  );
  const moneyUpfrontDisplay = Math.round(moneyUpfront).toLocaleString();
  const orderObject = createLimitOrderWithStop(
    symbol,
    positionSize,
    side,
    limitPrice,
    stopPrice
  );
  const createLimitOrder = () => createNewOrder(socket, orderObject);
  const cancelNewOrder = () => {
    cancelOrder(socket, orderId);
    setOrderId("");
  };
  const currentPrice = displayPrice(price);
  const { buttonClass, buttonText } = displayOrderButton(
    side,
    symbol,
    tradeableAssets
  );
  const onClickRemove = () => removeFromQuotesAndWatchlist(symbol);
  const isOrderButtonDisabled = isDisabled(
    side,
    stopPrice,
    currentPrice,
    symbol,
    positionSize,
    tradeableAssets,
    limitPrice,
    moneyUpfront,
    accountSize
  );

  return (
    <>
      <td>
        <strong>{symbol}</strong>
      </td>
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
          <td
            className="bg-warning"
            onClick={() => setLimitPrice(price)}
            style={{ cursor: "pointer" }}
          >
            <strong>{currentPrice}</strong>
          </td>
          <td>
            <input
              className="form-control"
              type="text"
              size="3"
              value={limitPrice}
              onChange={(e) => updateNumberField(e.target.value, setLimitPrice)}
            />
          </td>
          <td className="bg-success text-white">{profitTarget}</td>
          <td>
            <input
              className={stopPriceInputClassName}
              type="text"
              size="3"
              value={stopPrice}
              onChange={(e) => updateNumberField(e.target.value, setStopPrice)}
            />
          </td>
          <td>{positionSizeDisplay} shares</td>
          <td>${moneyUpfrontDisplay}</td>
          <td>
            <SpinnerButton
              socket={socket}
              buttonClass={buttonClass}
              buttonText={buttonText}
              buttonDisabled={isOrderButtonDisabled}
              onClickFunction={createLimitOrder}
              orderId={orderId}
              symbol={symbol}
            />
          </td>
        </>
      ) : (
        <>
          <td className="bg-light" colSpan="7">
            Awaiting price data...
          </td>
        </>
      )}
      <td colSpan="2">
        {orderId ? (
          <SpinnerButton
            socket={socket}
            buttonClass="btn btn-dark"
            buttonText="Cancel Order"
            onClickFunction={cancelNewOrder}
            orderId={orderId}
            symbol={symbol}
          />
        ) : (
          <button className="btn btn-secondary" onClick={onClickRemove}>
            Remove
          </button>
        )}
      </td>
    </>
  );
}

QuotesTableRowData.propTypes = {
  socket: PropTypes.object.isRequired,
  symbol: PropTypes.string.isRequired,
  priceObj: PropTypes.object.isRequired,
  removeFromWatchlist: PropTypes.func.isRequired,
  removeFromQuotesAndWatchlist: PropTypes.func.isRequired,
  tradeableAssets: PropTypes.object.isRequired,
  accountInfo: PropTypes.object.isRequired,
};

QuotesTableRowData.defaultProps = {
  socket: {},
  symbol: "",
  priceObj: {},
  tradeableAssets: {},
  accountInfo: {},
};
