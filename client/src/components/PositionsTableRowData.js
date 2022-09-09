import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SpinnerButton from "./SpinnerButton";
import { displayPrice } from "../shared/formatting";
import { updateNumberField } from "../shared/inputs";
import {
  createLimitOrder,
  createOrder,
  createStopOrder,
  cancelOrder,
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

  useEffect(() => {
    socket.on(`${symbol} newOrderResponse`, (data) => {
      const newOrderId = data.order.id;
      setOrderId(newOrderId);
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
      console.log("updating stopTarget");
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

  const sideInCaps = side.toUpperCase();
  const entryPrice = displayPrice(initialPrice);
  const currentPrice = displayPrice(price);
  const stopPrice = displayPrice(stopTarget.price);
  const cost = Math.round(initialPrice * quantity).toLocaleString();
  const orderSide = side === "long" ? "sell" : "buy";
  const limitOrder = createLimitOrder(symbol, quantity, orderSide, limitPrice);
  const submitOrder = () => createOrder(socket, limitOrder);
  const orderButtonText = side === "long" ? "Sell" : "Buy";
  const cancelNewOrder = () => {
    cancelOrder(socket, orderId);
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
        {displayPrice(profitTargetPrice)}
      </td>
    );
  });

  return (
    <tr className={rowClassName}>
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
      <td>
        $
        {profitOrLoss.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </td>
      <td>{quantity.toLocaleString()} shares</td>
      <td>${cost}</td>
      <td>
        {!orderId && (
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
        )}
        {orderId && (
          <SpinnerButton
            socket={socket}
            buttonClass="btn btn-dark"
            buttonText={`Cancel $${limitPrice} Order`}
            onClickFunction={cancelNewOrder}
            orderId={orderId}
            symbol={symbol}
          />
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
