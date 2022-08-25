import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SpinnerButton from "./SpinnerButton";
import { displayPrice } from "../shared/formatting";
import { updateNumberField } from "../shared/inputs";
import { createLimitOrder, createOrder } from "../shared/orders";

export default function PositionsTableRowData({
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
  const [targetPrice, setTargetPrice] = useState(0.0);
  const [targetQuantity, setTargetQuantity] = useState(0);
  const [targetSide, setTargetSide] = useState("");
  const [targetSubmitted, setTargetSubmitted] = useState(false);

  console.log(`${symbol} targetPrice`, targetPrice);

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
      setTargetPrice(firstUnfilledTarget.price);
      setTargetQuantity(firstUnfilledTarget.quantity);
      setTargetSide(firstUnfilledTarget.side);
      setTargetSubmitted(false);
    }
  }, [profitTargets]);

  // if long position
  let hasReachedTargetPrice = price >= targetPrice;
  if (side === "short") {
    hasReachedTargetPrice = price <= targetPrice;
  }

  if (
    targetSubmitted === false &&
    hasReachedTargetPrice &&
    targetQuantity > 0 &&
    targetPrice > 0
  ) {
    console.log("it has reached the target price");
    console.log("targetQuantity", targetQuantity);
    console.log("targetPrice", targetPrice);
    const targetOrder = createLimitOrder(
      symbol,
      targetQuantity,
      targetSide,
      targetPrice
    );
    console.log("target has been reached!");
    createOrder(socket, targetOrder);
    setTargetSubmitted(true);
  }

  const stopTargetPrice = stopTarget.price;
  const stopTargetQuantity = stopTarget.quantity;
  const stopTargetSide = stopTarget.side;

  // if long position
  let hasReachedStopPrice = price <= stopTargetPrice;
  if (side === "short") {
    hasReachedStopPrice = price >= stopTargetPrice;
  }

  if (
    targetSubmitted === false &&
    hasReachedStopPrice &&
    stopTargetQuantity > 0 &&
    stopTargetPrice > 0
  ) {
    const stopOrder = createLimitOrder(
      symbol,
      stopTargetQuantity,
      stopTargetSide,
      stopTargetPrice
    );
    console.log("stop target has been reached!");
    createOrder(socket, stopOrder);
    setTargetSubmitted(true);
  }

  const sideInCaps = side.toUpperCase();
  const entryPrice = displayPrice(initialPrice);
  const currentPrice = displayPrice(price);
  const stopPrice = displayPrice(stopTarget.price);
  const cost = Math.round(initialPrice * quantity).toLocaleString();
  const orderSide = side === "long" ? "sell" : "buy";
  const limitOrder = createLimitOrder(symbol, quantity, orderSide, limitPrice);
  const submitOrder = () => createOrder(socket, limitOrder);
  const orderButtonText = side === "long" ? "Sell" : "Buy";

  const profitTargetData = profitTargets.map((profitTarget) => {
    const { price } = profitTarget;
    const targetPriceClassName =
      price === targetPrice ? "bg-success text-white" : "bg-secondary";

    return <td className={targetPriceClassName}>{displayPrice(price)}</td>;
  });

  return (
    <>
      <td>
        <strong>{symbol}</strong>
      </td>
      <td>{sideInCaps}</td>
      <td>{entryPrice}</td>
      <td className="bg-danger text-white">{stopPrice}</td>
      <td
        className="bg-warning"
        onClick={() => setLimitPrice(currentPrice)}
        style={{ cursor: "pointer" }}
      >
        <strong>{currentPrice}</strong>
      </td>
      {profitTargetData}
      <td>${profitOrLoss.toLocaleString()}</td>
      <td>{quantity.toLocaleString()} shares</td>
      <td>${cost}</td>
      <td className="">
        <div className="d-flex">
          <input
            className="form-control"
            type="text"
            size="3"
            value={limitPrice}
            placeholder="Limit Price"
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
      </td>
    </>
  );
}

PositionsTableRowData.propTypes = {
  socket: PropTypes.object.isRequired,
  symbol: PropTypes.string.isRequired,
  side: PropTypes.string.isRequired,
  initialPrice: PropTypes.number.isRequired,
  price: PropTypes.number.isRequired,
  profitOrLoss: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired,
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string,
      filled_qty: PropTypes.string,
      filled_avg_price: PropTypes.string,
      status: PropTypes.string,
      legs: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string,
          limit_price: PropTypes.string,
          id: PropTypes.string,
          status: PropTypes.string,
          stop_price: PropTypes.string,
        })
      ),
    })
  ).isRequired,
};

PositionsTableRowData.defaultProps = {
  socket: {},
  symbol: "",
  side: "",
  initialPrice: 0,
  price: 0,
  profitOrLoss: 0,
  quantity: 0,
  orders: [],
};
