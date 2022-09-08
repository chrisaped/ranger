import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SpinnerButton from "./SpinnerButton";
import { displayPrice } from "../shared/formatting";
import { updateNumberField } from "../shared/inputs";
import {
  createLimitOrder,
  createOrder,
  createStopOrder,
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

  const [firstTargetPrice, setFirstTargetPrice] = useState(0.0);
  const [firstTargetQuantity, setFirstTargetQuantity] = useState(0);
  const [firstTargetSide, setFirstTargetSide] = useState("");
  const [firstTargetSubmitted, setFirstTargetSubmitted] = useState(false);

  const [secondTargetPrice, setSecondTargetPrice] = useState(0.0);
  const [secondTargetQuantity, setSecondTargetQuantity] = useState(0);
  const [secondTargetSide, setSecondTargetSide] = useState("");
  const [secondTargetSubmitted, setSecondTargetSubmitted] = useState(false);

  const [thirdTargetPrice, setThirdTargetPrice] = useState(0.0);
  const [thirdTargetQuantity, setThirdTargetQuantity] = useState(0);
  const [thirdTargetSide, setThirdTargetSide] = useState("");
  const [thirdTargetSubmitted, setThirdTargetSubmitted] = useState(false);

  const [stopTargetPrice, setStopTargetPrice] = useState(0.0);
  const [stopTargetQuantity, setStopTargetQuantity] = useState(0);
  const [stopTargetSide, setStopTargetSide] = useState("");
  const [stopTargetSubmitted, setStopTargetSubmitted] = useState(false);

  useEffect(() => {
    if (price && limitPrice === defaultLimitPrice) {
      setLimitPrice(price);
    }
  }, [price, limitPrice]);

  useEffect(() => {
    const firstTarget = profitTargets[0];
    setFirstTargetPrice(firstTarget.price);
    setFirstTargetQuantity(firstTarget.quantity);
    setFirstTargetSide(firstTarget.side);

    const secondTarget = profitTargets[1];
    setSecondTargetPrice(secondTarget.price);
    setSecondTargetQuantity(secondTarget.quantity);
    setSecondTargetSide(secondTarget.side);

    const thirdTarget = profitTargets[2];
    setThirdTargetPrice(thirdTarget.price);
    setThirdTargetQuantity(thirdTarget.quantity);
    setThirdTargetSide(thirdTarget.side);

    setStopTargetPrice(stopTarget.price);
    setStopTargetQuantity(stopTarget.quantity);
    setStopTargetSide(stopTarget.side);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (stopTarget.price !== stopTargetPrice) {
      console.log("updating stopTarget");
      setStopTargetPrice(stopTarget.price);
      setStopTargetQuantity(stopTarget.quantity);
      setStopTargetSide(stopTarget.side);
    }
  }, [stopTarget]); // eslint-disable-line

  const hasReachedTargetPrice = (targetPrice) => {
    if (targetPrice !== 0) {
      if (side === "long") {
        return price >= targetPrice;
      }
      return price <= targetPrice;
    }
  };

  if (
    !firstTargetSubmitted &&
    !stopTargetSubmitted &&
    hasReachedTargetPrice(firstTargetPrice)
  ) {
    console.log(`${symbol} reached firstTarget at ${firstTargetPrice}`);
    const targetOrder = createLimitOrder(
      symbol,
      firstTargetQuantity,
      firstTargetSide,
      firstTargetPrice
    );
    createOrder(socket, targetOrder);
    setFirstTargetSubmitted(true);
  } else if (
    !secondTargetSubmitted &&
    !stopTargetSubmitted &&
    hasReachedTargetPrice(secondTargetPrice)
  ) {
    console.log(`${symbol} reached secondTarget at ${secondTargetPrice}`);
    const targetOrder = createLimitOrder(
      symbol,
      secondTargetQuantity,
      secondTargetSide,
      secondTargetPrice
    );
    createOrder(socket, targetOrder);
    setSecondTargetSubmitted(true);
  } else if (
    !thirdTargetSubmitted &&
    !stopTargetSubmitted &&
    hasReachedTargetPrice(thirdTargetPrice)
  ) {
    console.log(`${symbol} reached thirdTarget at ${thirdTargetPrice}`);
    const targetOrder = createLimitOrder(
      symbol,
      thirdTargetQuantity,
      thirdTargetSide,
      thirdTargetPrice
    );
    createOrder(socket, targetOrder);
    setThirdTargetSubmitted(true);
  }

  const hasReachedStopPrice = (stopPrice) => {
    if (stopPrice !== 0) {
      if (side === "long") {
        return price <= stopPrice;
      }
      return price >= stopPrice;
    }
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

  let activeProfitTargetPrice = 0.0;
  if (!firstTargetSubmitted) {
    activeProfitTargetPrice = firstTargetPrice;
  } else if (!secondTargetSubmitted) {
    activeProfitTargetPrice = secondTargetPrice;
  } else if (!thirdTargetSubmitted) {
    activeProfitTargetPrice = thirdTargetPrice;
  }

  const profitTargetData = profitTargets.map((profitTarget) => {
    const profitTargetPrice = profitTarget.price;
    const targetPriceClassName =
      profitTargetPrice === activeProfitTargetPrice
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
