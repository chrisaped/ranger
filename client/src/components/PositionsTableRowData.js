import SpinnerButton from "./SpinnerButton";
import { displayPrice } from "../shared/formatting";
import { 
  createMarketOrder,
  createOrder,
  cancelOrder,
  extractBracketOrderInfo
} from "../shared/orders";

export default function PositionsTableRowData({
  socket,
  symbol,
  side,
  avgEntryPrice,
  price,
  profitOrLoss,
  quantity,
  orders
}) {
  const { 
    targetPrice, 
    targetOrderStatus,
    stopPrice,
    targetOrderId,
    hasLegs
  } = extractBracketOrderInfo(symbol, quantity, avgEntryPrice, orders);

  const sideInCaps = side.toUpperCase();
  const entryPrice = displayPrice(avgEntryPrice);
  const currentPrice = displayPrice(price);
  const hasNoBracketOrder = !hasLegs || (targetOrderStatus === "canceled");
  const targetPriceClassName = hasNoBracketOrder ? 'bg-secondary' : "bg-success text-white";
  const stopPriceClassName = hasNoBracketOrder ? 'bg-secondary' : "bg-danger text-white";
  const cost = Math.round(avgEntryPrice * quantity).toLocaleString();
  const marketOrder = createMarketOrder(symbol, quantity, side);
  const submitOrder = () => createOrder(socket, marketOrder);
  const cancelBracket = () => cancelOrder(socket, targetOrderId);
  const orderButtonText = side === "long" ? "Sell" : "Buy";

  return (
    <>
      <td><strong>{symbol}</strong></td>
      <td>{sideInCaps}</td>
      <td className="bg-info">{entryPrice}</td>
      <td className="bg-warning"><strong>{currentPrice}</strong></td>
      <td className={targetPriceClassName}>{targetPrice}</td>
      <td className={stopPriceClassName}>{stopPrice}</td>
      <td>${profitOrLoss}</td>
      <td>{quantity} shares</td>
      <td>${cost}</td>
      <td>
      {hasNoBracketOrder ? (
        <SpinnerButton 
          socket={socket}
          buttonClass="btn btn-dark"
          buttonText={orderButtonText}
          buttonDisabled={!hasNoBracketOrder}
          onClickFunction={submitOrder}
          symbol={symbol}
        />
      ):(
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
      </td>    
    </>
  );
}
