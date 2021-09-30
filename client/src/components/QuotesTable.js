import { useState, useEffect } from "react";
import SpinnerButton from "./SpinnerButton";
import {
  calculatProfitTarget,
  calculatePositionSize,
  calculateMoneyUpfront,
  calculateDefaultStopPrice,
  defaultStopPriceDifference
} from "../shared/calculations";
import { displayPrice } from "../shared/formatting";
import { 
  cancelOrder, 
  createBracketOrderObject,
  createOrder
} from "../shared/orders";
import { updateObjectState } from "../shared/state";

export default function QuotesTable({ 
  socket, 
  quotes, 
  deleteFromWatchlist,
  watchlist,
  tradeableAssets,
  setWatchlist
}) {
  const [sides, setSides] = useState({});
  const [stopPrices, setStopPrices] = useState({});
  const [orderIds, setOrderIds] = useState({});

  useEffect(() => {
    if (watchlist.length > 0) {
      const newSetSidesObj = sides;
      watchlist.forEach(symbol => {
        if(!(symbol in newSetSidesObj)) {
          newSetSidesObj[symbol] = 'buy';
        }
      })
      setSides(newSetSidesObj);
    }

    if (Object.keys(quotes).length > 0) {
      const stopPricesLength = Object.keys(stopPrices).length;
      const newStopPrices = stopPrices;
      Object.entries(quotes).forEach(([symbol, price]) => {
        if (!(symbol in newStopPrices) && watchlist.includes(symbol)) {
          const stopPrice = (price - defaultStopPriceDifference).toFixed(2);
          newStopPrices[symbol] = stopPrice;
        }
      });
      const newStopPricesLength = Object.keys(newStopPrices).length;
      if (newStopPricesLength > stopPricesLength) {
        setStopPrices(newStopPrices);
      }
    }

    socket.on('newOrderUpdateResponse', (data) => {
      const symbol = data.order.symbol;
      const orderStatus = data.order.status;
      if (watchlist.includes(symbol) && orderStatus === 'new') {
        const orderId = data.order.id;
        updateObjectState(setOrderIds, symbol, orderId);
      }
    });

    socket.on('fillOrderUpdateResponse', (data) => {
      const symbol = data.order.symbol;
      const orderStatus = data.order.status;
      if (watchlist.includes(symbol) && orderStatus === 'filled') {
        const newWatchlist = watchlist.filter(watchlistSymbol => watchlistSymbol !== symbol);
        setWatchlist(newWatchlist);
        console.log('WHOA!');
        // need to uncomment this, but this is getting fired too many times
        // socket.emit('removeFromWatchlist', symbol);
        if (Object.keys(orderIds).length > 0) {
          const newOrderIds = orderIds;
          delete newOrderIds[symbol];
          setOrderIds(newOrderIds);
        }
      }
    });
  }, [watchlist, quotes, sides, stopPrices, socket, orderIds, setWatchlist]);

  const cancelNewOrder = (symbol, orderId) => {
    cancelOrder(socket, orderId);
    if (Object.keys(orderIds).length > 0) {
      const newOrderIds = orderIds;
      delete newOrderIds[symbol];
      setOrderIds(newOrderIds);
    }
  };

  const onSelectChange = (symbol, side, price) => {
    updateObjectState(setSides, symbol, side);
    const newDefaultStopPrice = calculateDefaultStopPrice(side, price);
    updateObjectState(setStopPrices, symbol, newDefaultStopPrice);
  };

  const displayOrderButton = (side, symbol) => {
    let buttonText = 'Long';
    let buttonClass = "btn btn-success";

    if (side === 'sell') {
      buttonText = 'Short';
      buttonClass = "btn btn-danger";
      if (!isShortable(symbol)) {
        buttonText = 'Not Shortable'
      }
    }

    return { buttonText, buttonClass };
  }

  const isForbiddenStopPrice = (side, stopPrice, price) => {
    if ((side === 'buy') && (stopPrice > price)) {
      return true;
    }
    if ((side === 'sell') && (stopPrice < price)) {
      return true;
    }
    return false;    
  };

  const isShortable = (symbol) => {
    const assetsObject = tradeableAssets[symbol];
    return assetsObject?.shortable;
  };

  const isProperPositionSize = (positionSize) => {
    if (positionSize === 0) {
      return false;
    }
    return true;
  };

  const isDisabled = (side, stopPrice, currentPrice, symbol, positionSize) => {
    if (side === 'sell') {
      if (
        isForbiddenStopPrice(side, stopPrice, currentPrice) || 
        !isShortable(symbol) ||
        !isProperPositionSize(positionSize)
      ) {
        return true;
      }
    }

    if (side === 'buy') {
      if (
        isForbiddenStopPrice(side, stopPrice, currentPrice) ||
        !isProperPositionSize(positionSize)
      ) {
        return true;
      }
    }

    return false;
  };

  return (
    <table className="table table-bordered align-middle text-center">
      <thead className="table-dark">
        <tr>
          <th>Symbol</th>
          <th>Side</th>
          <th>Price</th>
          <th>Target</th>
          <th>Stop</th>
          <th>Shares</th>
          <th>Cost</th>
          <th colSpan="2">Actions</th>
        </tr>
      </thead>
      <tbody>
      {watchlist.map((symbol, index) => {
        const price = quotes[symbol];
        const stopPrice = stopPrices[symbol];
        const side = sides[symbol];
        const orderId = orderIds[symbol];
        const profitTarget = calculatProfitTarget(price, stopPrice, side);
        const positionSize = calculatePositionSize(price, stopPrice);
        const moneyUpfront = calculateMoneyUpfront(price, stopPrice);
        const orderObject = createBracketOrderObject(symbol, side, positionSize, profitTarget, stopPrice);
        const createBracketOrder = () => createOrder(socket, orderObject);
        const cancelOrder = () => cancelNewOrder(symbol, orderId);
        const currentPrice = displayPrice(price);
        const { buttonClass, buttonText } = displayOrderButton(side, symbol);

        return (
          <tr key={symbol}>
            <td><strong>{symbol}</strong></td>
            {price ? (
              <>
                <td>
                  <select 
                    className="form-select" 
                    value={side}
                    onChange={(e) => onSelectChange(symbol, e.target.value, price)}
                  >
                    <option value="buy">Long</option>
                    <option value="sell">Short</option>
                  </select>
                </td>
                <td className="bg-warning"><strong>{currentPrice}</strong></td>
                <td className="bg-success text-white">{profitTarget}</td>
                <td>
                  <input 
                    className={
                      isForbiddenStopPrice(side, stopPrice, currentPrice)
                      ? "form-control border border-danger"
                      : "form-control"
                    }
                    type="text"
                    size="4"
                    value={stopPrice} 
                    onChange={(e) => updateObjectState(setStopPrices, symbol, e.target.value)} 
                  />         
                </td>
                <td>{positionSize} shares</td>
                <td>${moneyUpfront}</td>
                <td>
                  <SpinnerButton 
                    socket={socket}
                    buttonClass={buttonClass}
                    buttonText={buttonText}
                    buttonDisabled={isDisabled(side, stopPrice, currentPrice, symbol, positionSize)}
                    onClickFunction={createBracketOrder}
                    orderId={orderId}
                    key={index}
                  />
                </td>       
              </>
            ):(
              <>
                <td className="bg-light" colSpan="7">
                  Awaiting price data...
                </td>
              </>
            )}
            <td>
              {orderId ? (
                <SpinnerButton 
                  socket={socket}
                  buttonClass="btn btn-dark"
                  buttonText='Cancel Order'
                  onClickFunction={cancelOrder}
                  orderId={orderId}
                  key={index}
                />
              ):(
                <button 
                  className="btn btn-secondary" 
                  onClick={() => deleteFromWatchlist(symbol)}
                >
                  Remove
                </button>
              )}
            </td>      
          </tr>
        );
      })}
      </tbody>
    </table>    
  );
}
