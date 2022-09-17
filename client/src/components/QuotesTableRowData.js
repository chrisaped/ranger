import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SpinnerButton from "./SpinnerButton";
import {
  calculatePositionSize,
  calculateMoneyUpfront,
  calculateDefaultStopPrice,
  calculateLastProfitTarget,
} from "../shared/calculations";
import {
  createNewOrder,
  cancelOrder,
  createLimitOrderWithStop,
} from "../shared/orders";
import { updateNumberField } from "../shared/inputs";
import { displayCurrency, displayRoundNumber } from "../shared/formatting";
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
  lastMultiplier,
}) {
  const defaultStopPrice = 0.0;
  const defaultLimitPrice = 0.0;
  const [stopPrice, setStopPrice] = useState(defaultStopPrice);
  const [limitPrice, setLimitPrice] = useState(defaultLimitPrice);
  const [side, setSide] = useState("buy");
  const [orderId, setOrderId] = useState("");
  const [lastPrice, setLastPrice] = useState(0.0);

  const stopPriceNum = parseFloat(stopPrice);
  const limitPriceNum = parseFloat(limitPrice);
  const lastPriceNum = parseFloat(lastPrice);

  let price = selectPrice(priceObj, side);
  if (!price && lastPriceNum !== 0.0) price = lastPriceNum;

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

    socket.on("getNewOrdersResponse", (dataArray) => {
      dataArray.forEach((obj) => {
        if (obj.symbol === symbol && !obj.filled_at) setOrderId(obj.id);
      });
    });

    socket.on(`${symbol} getLatestTradeResponse`, (data) => {
      const latestPrice = data.Price;
      setLastPrice(latestPrice);
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!price) socket.emit("getLatestTrade", symbol);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (price && stopPriceNum === defaultStopPrice) {
      let newDefaultStopPrice = price - defaultStopPriceDifference;
      if (newDefaultStopPrice < 0) newDefaultStopPrice = 0.01;
      setStopPrice(newDefaultStopPrice);
    }
  }, [price, stopPriceNum]);

  useEffect(() => {
    if (price && limitPriceNum === defaultLimitPrice) setLimitPrice(price);
  }, [price, limitPriceNum]);

  const onSelectChange = (e) => {
    const newSide = e.target.value;
    setSide(newSide);
    let newDefaultStopPrice = calculateDefaultStopPrice(side, limitPriceNum);
    if (newDefaultStopPrice < 0) newDefaultStopPrice = 0.01;
    setStopPrice(newDefaultStopPrice);
  };

  const stopPriceInputClassName = isForbiddenStopPrice(
    side,
    stopPriceNum,
    limitPriceNum
  )
    ? "form-control border border-danger"
    : "form-control";

  const accountSize = accountInfo.buying_power;

  const positionSize = calculatePositionSize(
    limitPriceNum,
    stopPriceNum,
    accountSize
  );

  const profitTarget = calculateLastProfitTarget(
    limitPriceNum,
    stopPriceNum,
    side,
    lastMultiplier
  );

  const moneyUpfront = calculateMoneyUpfront(
    limitPriceNum,
    stopPriceNum,
    accountSize
  );

  const orderObject = createLimitOrderWithStop(
    symbol,
    positionSize,
    side,
    limitPriceNum,
    stopPriceNum
  );

  const createLimitOrder = () => createNewOrder(socket, orderObject);

  const cancelNewOrder = () => {
    const orderObj = {
      orderId: orderId,
      symbol: symbol,
      cancelPosition: true,
    };
    cancelOrder(socket, orderObj);
    setOrderId("");
  };

  const { buttonClass, buttonText } = displayOrderButton(
    side,
    symbol,
    tradeableAssets
  );

  const onClickRemove = () => removeFromQuotesAndWatchlist(symbol);

  const isOrderButtonDisabled = isDisabled(
    side,
    stopPriceNum,
    price,
    symbol,
    positionSize,
    tradeableAssets,
    limitPriceNum,
    moneyUpfront,
    accountSize
  );

  const inputIsDisabled = orderId !== "";

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
            <strong>{displayCurrency(price)}</strong>
          </td>
          <td>
            <input
              className="form-control"
              type="text"
              size="3"
              value={limitPrice}
              disabled={inputIsDisabled}
              onChange={(e) => updateNumberField(e.target.value, setLimitPrice)}
            />
          </td>
          <td className="bg-success text-white">
            {displayCurrency(profitTarget)}
          </td>
          <td>
            <input
              className={stopPriceInputClassName}
              type="text"
              size="3"
              value={stopPrice}
              disabled={inputIsDisabled}
              onChange={(e) => updateNumberField(e.target.value, setStopPrice)}
            />
          </td>
          <td>{displayRoundNumber(positionSize)} shares</td>
          <td>${displayRoundNumber(moneyUpfront)}</td>
          <td>
            {orderId ? (
              <SpinnerButton
                socket={socket}
                buttonClass="btn btn-dark"
                buttonText={`Cancel $${limitPrice} Order`}
                onClickFunction={cancelNewOrder}
                orderId={orderId}
                symbol={symbol}
              />
            ) : (
              <SpinnerButton
                socket={socket}
                buttonClass={buttonClass}
                buttonText={buttonText}
                buttonDisabled={isOrderButtonDisabled}
                onClickFunction={createLimitOrder}
                orderId={orderId}
                symbol={symbol}
              />
            )}
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
        {!orderId && (
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
