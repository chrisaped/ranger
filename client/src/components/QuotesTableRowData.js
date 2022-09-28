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
  removeFromQuotesAndWatchlist,
  tradeableAssets,
  accountInfo,
  lastMultiplier,
  pendingPosition,
  newOrder,
  watchlist,
  setWatchlist,
}) {
  const defaultStopPrice = 0.0;
  const defaultLimitPrice = 0.0;
  const [stopPrice, setStopPrice] = useState(defaultStopPrice);
  const [limitPrice, setLimitPrice] = useState(defaultLimitPrice);
  const [side, setSide] = useState("buy");
  const [orderId, setOrderId] = useState("");
  const [lastPrice, setLastPrice] = useState(0.0);

  let price = selectPrice(priceObj, side);
  if (!price && lastPrice !== 0.0) price = lastPrice;

  useEffect(() => {
    socket.on(`${symbol} createNewOrderResponse`, (data) => {
      const newOrderId = data.id;
      setOrderId(newOrderId);
    });

    socket.on(`${symbol} getLatestTradeResponse`, (data) => {
      const latestPrice = data.Price;
      setLastPrice(latestPrice);
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    socket.on(`${symbol} fillOrderResponse`, (_data) => {
      if (watchlist.includes(symbol)) {
        const newWatchlist = watchlist.filter(
          (watchlistSymbol) => watchlistSymbol !== symbol
        );
        setWatchlist(newWatchlist);
        socket.emit("removeFromWatchlist", symbol);
      }
    });
  }, [watchlist]); // eslint-disable-line

  useEffect(() => {
    if (!price && !newOrder && !pendingPosition)
      socket.emit("getLatestTrade", symbol);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (price && stopPrice === defaultStopPrice) {
      let newDefaultStopPrice = price - defaultStopPriceDifference;
      if (newDefaultStopPrice < 0) newDefaultStopPrice = 0.01;
      newDefaultStopPrice = newDefaultStopPrice.toFixed(2);
      setStopPrice(newDefaultStopPrice);
    }
  }, [price, stopPrice]);

  useEffect(() => {
    if (price && limitPrice === defaultLimitPrice) {
      const formattedPrice = price.toFixed(2);
      setLimitPrice(formattedPrice);
    }
  }, [price, limitPrice]);

  useEffect(() => {
    if (pendingPosition && newOrder) {
      setStopPrice(pendingPosition.initial_stop_price);
      setLimitPrice(pendingPosition.initial_price);
      setOrderId(newOrder.id);
      setSide(newOrder.side);
    }
  }, [pendingPosition, newOrder]);

  const onSelectChange = (e) => {
    const newSide = e.target.value;
    setSide(newSide);
    let newDefaultStopPrice = calculateDefaultStopPrice(side, limitPrice);
    if (newDefaultStopPrice < 0) newDefaultStopPrice = 0.01;
    newDefaultStopPrice = newDefaultStopPrice.toFixed(2);
    setStopPrice(newDefaultStopPrice);
  };

  const stopPriceIsForbidden = isForbiddenStopPrice(
    side,
    stopPrice,
    limitPrice
  );

  const stopPriceInputClassName = stopPriceIsForbidden
    ? "form-control border border-danger"
    : "form-control";

  const accountSize = accountInfo.buying_power;

  const positionSize = calculatePositionSize(
    limitPrice,
    stopPrice,
    accountSize
  );

  const profitTarget = calculateLastProfitTarget(
    limitPrice,
    stopPrice,
    side,
    lastMultiplier
  );

  const moneyUpfront = calculateMoneyUpfront(
    limitPrice,
    stopPrice,
    accountSize
  );

  const orderObject = createLimitOrderWithStop(
    symbol,
    positionSize,
    side,
    limitPrice,
    stopPrice
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
    stopPrice,
    price,
    symbol,
    positionSize,
    tradeableAssets,
    limitPrice,
    moneyUpfront,
    accountSize
  );

  const inputIsDisabled = orderId !== "";
  const inputWidthPercentage = "9%";

  return (
    <>
      <td>
        <strong>{symbol}</strong>
      </td>
      {price || (newOrder && pendingPosition) ? (
        <>
          <td>
            <select
              className="form-select"
              value={side}
              onChange={onSelectChange}
              disabled={inputIsDisabled}
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
          <td style={{ width: inputWidthPercentage }}>
            <input
              className="form-control"
              type="text"
              value={limitPrice}
              disabled={inputIsDisabled}
              placeholder="Limit"
              onChange={(e) => updateNumberField(e.target.value, setLimitPrice)}
            />
          </td>
          <td className="bg-success text-white">
            {displayCurrency(profitTarget)}
          </td>
          <td style={{ width: inputWidthPercentage }}>
            <input
              className={stopPriceInputClassName}
              type="text"
              value={stopPrice}
              disabled={inputIsDisabled}
              placeholder="Stop"
              onChange={(e) => updateNumberField(e.target.value, setStopPrice)}
            />
          </td>
          <td>{displayRoundNumber(positionSize)} shares</td>
          <td>${displayRoundNumber(moneyUpfront)}</td>
          <td>
            <SpinnerButton
              socket={socket}
              buttonClass={buttonClass}
              buttonText={buttonText}
              buttonDisabled={
                isOrderButtonDisabled || inputIsDisabled || stopPriceIsForbidden
              }
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
            buttonText={`Cancel $${limitPrice} Order`}
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
