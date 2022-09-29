import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SpinnerButton from "./SpinnerButton";
import {
  displayRoundNumber,
  displayCurrency,
  capitalizeString,
} from "../shared/formatting";
import { updateNumberField } from "../shared/inputs";
import {
  createLimitOrder,
  createOrder,
  createStopOrder,
  cancelOrder,
  determinePositionOrderSide,
} from "../shared/orders";

export default function PositionsTableRowData({
  rowClassName,
  socket,
  symbol,
  side,
  initialPrice,
  price,
  profitOrLoss,
  quantity,
  profitTargets,
  stopTarget,
}) {
  const defaultLimitPrice = 0;
  const [limitPrice, setLimitPrice] = useState(defaultLimitPrice);
  const [orderId, setOrderId] = useState("");
  const [targetPrice, setTargetPrice] = useState(0.0);
  const [targetQuantity, setTargetQuantity] = useState(0);
  const [targetSide, setTargetSide] = useState("");
  const [targetSubmitted, setTargetSubmitted] = useState(false);
  const [stopTargetPrice, setStopTargetPrice] = useState(0.0);
  const [stopTargetQuantity, setStopTargetQuantity] = useState(0);
  const [stopTargetSide, setStopTargetSide] = useState("");
  const [stopTargetSubmitted, setStopTargetSubmitted] = useState(false);
  const [lastPrice, setLastPrice] = useState(0.0);

  if (!price && lastPrice !== 0.0) price = lastPrice;

  useEffect(() => {
    if (!price) socket.emit("getLatestTrade", symbol);
  }, []); // eslint-disable-line

  useEffect(() => {
    socket.on(`${symbol} newOrderResponse`, (data) => {
      const newOrderId = data.order.id;
      setOrderId(newOrderId);
    });

    socket.on(`${symbol} fillOrderResponse`, (_data) => setOrderId(""));

    socket.on(`${symbol} getLatestTradeResponse`, (data) => {
      const latestPrice = data.Price;
      setLastPrice(latestPrice);
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (price && limitPrice === defaultLimitPrice) {
      setLimitPrice(price);
    }
  }, [price, limitPrice]);

  useEffect(() => {
    const unFilledTargets = profitTargets.filter(
      (target) => target.filled === false
    );

    if (unFilledTargets.length > 0) {
      const firstUnfilledTarget = unFilledTargets[0];
      const firstUnfilledTargetPrice = firstUnfilledTarget.price;

      if (firstUnfilledTargetPrice !== targetPrice) {
        setTargetPrice(firstUnfilledTargetPrice);
        setTargetQuantity(firstUnfilledTarget.quantity);
        setTargetSide(firstUnfilledTarget.side);
        setTargetSubmitted(false);
      }
    }
  }, [profitTargets]); // eslint-disable-line

  useEffect(() => {
    if (stopTarget.price !== stopTargetPrice) {
      console.log(`setting ${symbol} stopTarget at ${stopTarget.price}`);
      setStopTargetPrice(stopTarget.price);
      setStopTargetQuantity(stopTarget.quantity);
      setStopTargetSide(stopTarget.side);
    }
  }, [stopTarget]); // eslint-disable-line

  const hasReachedTargetPrice = (targetPrice) => {
    if (price && targetPrice !== 0) {
      if (side === "long") {
        return price >= targetPrice;
      }
      return price <= targetPrice;
    }
    return false;
  };

  if (
    !targetSubmitted &&
    !stopTargetSubmitted &&
    hasReachedTargetPrice(targetPrice)
  ) {
    console.log(`${symbol} reached target at ${targetPrice}`);
    const targetOrder = createLimitOrder(
      symbol,
      targetQuantity,
      targetSide,
      targetPrice
    );
    createOrder(socket, targetOrder);
    setTargetSubmitted(true);
  }

  const hasReachedStopPrice = (stopPrice) => {
    if (price && stopPrice !== 0) {
      if (side === "long") {
        return price <= stopPrice;
      }
      return price >= stopPrice;
    }
    return false;
  };

  if (!stopTargetSubmitted && hasReachedStopPrice(stopTargetPrice)) {
    console.log(
      `${symbol} hasReachedStopPrice, stopPrice: ${stopTargetPrice}, price: ${price}, side: ${side}`
    );
    const stopOrder = createStopOrder(
      symbol,
      stopTargetQuantity,
      stopTargetSide,
      stopTargetPrice
    );
    createOrder(socket, stopOrder);
    setStopTargetSubmitted(true);
  }

  const cost = displayRoundNumber(initialPrice * quantity);
  const orderSide = determinePositionOrderSide(side);
  const limitOrder = createLimitOrder(symbol, quantity, orderSide, limitPrice);
  const submitOrder = () => createOrder(socket, limitOrder);
  const orderButtonText = capitalizeString(orderSide);
  const cancelNewOrder = () => {
    const orderObj = {
      orderId: orderId,
      symbol: symbol,
      cancelPosition: false,
    };
    cancelOrder(socket, orderObj);
    setOrderId("");
  };

  const profitTargetData = profitTargets.map((profitTarget) => {
    const profitTargetPrice = profitTarget.price;
    const targetPriceClassName =
      profitTargetPrice === targetPrice
        ? "bg-success text-white"
        : "bg-secondary";

    return (
      <td className={targetPriceClassName}>
        {displayCurrency(profitTargetPrice)}
      </td>
    );
  });

  return (
    <tr className={rowClassName}>
      <td>
        <strong>{symbol}</strong>
      </td>
      <td>{side.toUpperCase()}</td>
      <td>{displayCurrency(initialPrice)}</td>
      <td className="bg-danger text-white">
        {displayCurrency(stopTarget.price)}
      </td>
      <td
        className="bg-warning"
        onClick={() => setLimitPrice(price)}
        style={{ cursor: "pointer" }}
      >
        <strong>{displayCurrency(price)}</strong>
      </td>
      {profitTargetData}
      <td>${displayCurrency(profitOrLoss)}</td>
      <td>{displayRoundNumber(quantity)} shares</td>
      <td>${cost}</td>
      <td style={{ width: "15%" }}>
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
          <div className="d-flex">
            <input
              className="form-control mx-1"
              type="text"
              value={limitPrice}
              placeholder="Limit"
              onChange={(e) => updateNumberField(e.target.value, setLimitPrice)}
            />
            <SpinnerButton
              socket={socket}
              buttonClass="btn btn-dark"
              buttonText={orderButtonText}
              buttonDisabled={!limitPrice}
              onClickFunction={submitOrder}
              symbol={symbol}
            />
          </div>
        )}
      </td>
    </tr>
  );
}

PositionsTableRowData.propTypes = {
  socket: PropTypes.object.isRequired,
  symbol: PropTypes.string.isRequired,
  side: PropTypes.string.isRequired,
  initialPrice: PropTypes.number.isRequired,
  price: PropTypes.number.isRequired,
  profitOrLoss: PropTypes.number.isRequired,
  quantity: PropTypes.number.isRequired,
};

PositionsTableRowData.defaultProps = {
  socket: {},
  symbol: "",
  side: "",
  initialPrice: 0,
  price: 0,
  profitOrLoss: 0,
  quantity: 0,
};
