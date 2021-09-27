import { useState, useEffect } from "react";
import {
  calculatProfitTarget,
  calculatePositionSize,
  calculateMoneyUpfront,
  calculateDefaultStopPrice,
  defaultStopPriceDifference
} from "../shared/calculations";
import { displayPrice } from "../shared/formatting";
import { createBracketOrder } from "../shared/orders";
import { updateObjectState } from "../shared/state";

export default function QuotesTable({ 
  socket, 
  quotes, 
  deleteFromWatchlist,
  watchlist,
  tradeableAssets
}) {
  const [sides, setSides] = useState({});
  const [stopPrices, setStopPrices] = useState({});

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
  }, [watchlist, quotes, sides, stopPrices]);

  const onStopPriceChange = (symbol, newStopPrice) => {
    updateObjectState(setStopPrices, symbol, newStopPrice);
  };

  const createOrder = (symbol, orderObject) => {
    deleteFromWatchlist(symbol);
    socket.emit('createOrder', orderObject);
  };

  const onSelectChange = (symbol, side, price) => {
    updateObjectState(setSides, symbol, side);
    const newDefaultStopPrice = calculateDefaultStopPrice(side, price);
    updateObjectState(setStopPrices, symbol, newDefaultStopPrice);
  };

  const displayOrderButton = (side, symbol) => {
    let buttonText = 'Long';
    let buttonClass = "btn btn-success m-2";

    if (side === 'sell') {
      buttonText = 'Short';
      buttonClass = "btn btn-danger m-2";
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
  }

  const isShortable = (symbol) => {
    const assetsObject = tradeableAssets[symbol];
    return assetsObject?.shortable;
  }

  return (
    <table className="table table-bordered">
      <thead className="table-dark">
        <tr>
          <th>Symbol</th>
          <th>Side</th>
          <th>Current Price</th>
          <th>Target Price</th>
          <th>Stop Price</th>
          <th>Shares</th>
          <th>Money Upfront</th>
          <th colSpan="2">Actions</th>
        </tr>
      </thead>
      <tbody>
      {Object.entries(quotes).map(([symbol, price]) => {
        const stopPrice = stopPrices[symbol];
        const side = sides[symbol];
        const profitTarget = calculatProfitTarget(price, stopPrice, side);
        const positionSize = calculatePositionSize(price, stopPrice);
        const moneyUpfront = calculateMoneyUpfront(price, stopPrice);
        const orderObject = createBracketOrder(symbol, side, positionSize, profitTarget, stopPrice);
        const currentPrice = displayPrice(price);
        const { buttonClass, buttonText } = displayOrderButton(side, symbol);

        return (
          <tr key={symbol}>
            <td><strong>{symbol}</strong></td>
            <td className="p-3">
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
                placeholder="Stop Price"
                value={stopPrice} 
                onChange={(e) => onStopPriceChange(symbol, e.target.value)} 
              />         
            </td>
            <td>{positionSize} shares</td>
            <td>${moneyUpfront}</td>
            <td>
              {side === 'sell' ? (
                <button 
                  className={buttonClass}
                  onClick={() => createOrder(symbol, orderObject)}
                  disabled={isForbiddenStopPrice(side, stopPrice, currentPrice) || !isShortable(symbol)}
                >
                  {buttonText}
                </button>
              ):(
                <button 
                  className={buttonClass}
                  onClick={() => createOrder(symbol, orderObject)}
                  disabled={isForbiddenStopPrice(side, stopPrice, currentPrice)}
                >
                  {buttonText}
                </button>                
              )}
            </td>
            <td>
              <button 
                className="btn btn-secondary m-2" 
                onClick={() => deleteFromWatchlist(symbol)}
              >
                Remove
              </button>
            </td>      
          </tr>
        );
      })}
      </tbody>
    </table>    
  );
}
