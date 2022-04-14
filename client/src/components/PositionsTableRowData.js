import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SpinnerButton from "./SpinnerButton";
import { displayPrice } from "../shared/formatting";
import { updateNumberField } from "../shared/inputs";
import {
  createLimitOrder,
  createOrder,
  cancelOrder,
  extractBracketOrderInfo,
} from "../shared/orders";

export default function PositionsTableRowData({
  socket,
  symbol,
  side,
  avgEntryPrice,
  price,
  profitOrLoss,
  quantity,
  orders,
}) {
  const defaultLimitPrice = 0;
  const [orderId, setOrderId] = useState("");
  const [limitPrice, setLimitPrice] = useState(defaultLimitPrice);

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

  const { targetPrice, targetOrderStatus, stopPrice, targetOrderId, hasLegs } =
    extractBracketOrderInfo(symbol, quantity, avgEntryPrice, orders);
  const sideInCaps = side.toUpperCase();
  const entryPrice = displayPrice(avgEntryPrice);
  const currentPrice = displayPrice(price);
  const hasNoBracketOrder = !hasLegs || targetOrderStatus === "canceled";
  const targetPriceClassName = hasNoBracketOrder
    ? "bg-secondary"
    : "bg-success text-white";
  const stopPriceClassName = hasNoBracketOrder
    ? "bg-secondary"
    : "bg-danger text-white";
  const cost = Math.round(avgEntryPrice * quantity).toLocaleString();
  const limitOrder = createLimitOrder(symbol, quantity, side, limitPrice);
  const submitOrder = () => createOrder(socket, limitOrder);
  const cancelBracket = () => cancelOrder(socket, targetOrderId);
  const orderButtonText = side === "long" ? "Sell" : "Buy";
  const cancelNewOrder = () => {
    cancelOrder(socket, orderId);
    setOrderId("");
  };

  return (
    <>
      <td>
        <strong>{symbol}</strong>
      </td>
      <td>{sideInCaps}</td>
      <td className="bg-info">{entryPrice}</td>
      <td
        className="bg-warning"
        onClick={() => setLimitPrice(currentPrice)}
        style={{ cursor: "pointer" }}
      >
        <strong>{currentPrice}</strong>
      </td>
      <td className={targetPriceClassName}>{targetPrice}</td>
      <td className={stopPriceClassName}>{stopPrice}</td>
      <td>${profitOrLoss}</td>
      <td>{quantity.toLocaleString()} shares</td>
      <td>${cost}</td>
      <td className="">
        {hasNoBracketOrder ? (
          <>
            {!orderId && (
              <div className="d-flex">
                <input
                  className="form-control"
                  type="text"
                  size="3"
                  value={limitPrice}
                  placeholder="Limit Price"
                  onChange={(e) =>
                    updateNumberField(e.target.value, setLimitPrice)
                  }
                />
                <SpinnerButton
                  socket={socket}
                  buttonClass="btn btn-dark"
                  buttonText={orderButtonText}
                  buttonDisabled={!hasNoBracketOrder || !limitPrice}
                  onClickFunction={submitOrder}
                  symbol={symbol}
                />
              </div>
            )}
          </>
        ) : (
          <SpinnerButton
            socket={socket}
            buttonClass="btn btn-dark"
            buttonText="Cancel Bracket"
            buttonDisabled={hasNoBracketOrder}
            onClickFunction={cancelBracket}
            orderId={targetOrderId}
            symbol={symbol}
          />
        )}
        {hasNoBracketOrder && orderId && (
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
    </>
  );
}

PositionsTableRowData.propTypes = {
  socket: PropTypes.object.isRequired,
  symbol: PropTypes.string.isRequired,
  side: PropTypes.string.isRequired,
  avgEntryPrice: PropTypes.string.isRequired,
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
  avgEntryPrice: 0,
  price: 0,
  profitOrLoss: 0,
  quantity: 0,
  orders: [],
};
