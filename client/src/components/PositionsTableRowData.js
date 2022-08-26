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
    setStopTargetPrice(stopTarget.price);
    setStopTargetQuantity(stopTarget.quantity);
    setStopTargetSide(stopTarget.side);
    setStopTargetSubmitted(false);
  }, [stopTarget]);

  const hasReachedTargetPrice = (targetPrice) => {
    if (side === "long") {
      return price >= targetPrice;
    }
    return price <= targetPrice;
  };

  if (!firstTargetSubmitted && hasReachedTargetPrice(firstTargetPrice)) {
    console.log("reached firstTarget");
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
    hasReachedTargetPrice(secondTargetPrice)
  ) {
    console.log("reached secondTarget");
    const targetOrder = createLimitOrder(
      symbol,
      secondTargetQuantity,
      secondTargetSide,
      secondTargetPrice
    );
    createOrder(socket, targetOrder);
    setSecondTargetSubmitted(true);
  } else if (!thirdTargetSubmitted && hasReachedTargetPrice(thirdTargetPrice)) {
    console.log("reached thirdTarget");
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
    if (side === "long") {
      return price <= stopPrice;
    }
    return price >= stopPrice;
  };

  if (!stopTargetSubmitted && hasReachedStopPrice(stopTargetPrice)) {
    console.log("reached stopTarget");
    const stopOrder = createLimitOrder(
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
    const targetPriceClassName =
      profitTarget.price === activeProfitTargetPrice
        ? "bg-success text-white"
        : "bg-secondary";

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
