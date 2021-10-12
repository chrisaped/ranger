import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { updateObjectState } from "../shared/state";
import { checkMark, xMark } from "../shared/icons";

export default function Indicators({ 
  socket, 
  symbol, 
  price,
  side
}) {
  const [indicators, setIndicators] = useState({});

  useEffect(() => {
    socket.on(`${symbol} VWAP`, (data) => {
      addIndicator('VWAP', data);
    });

    socket.on(`${symbol} 3EMA`, (data) => {
      addIndicator('3EMA', data);
    });

    socket.on(`${symbol} 8EMA`, (data) => {
      addIndicator('8EMA', data);
    });
  }, []) // eslint-disable-line

  const addIndicator = (indicator, value) => {
    updateObjectState(setIndicators, indicator, value);
  };

  let EMAIcon = xMark;
  let VWAPIcon = xMark;
  const buySide = side === 'buy' || side === 'long';
  const sellSide = side === 'sell' || side === 'short';
  const threeEMAGreaterThanEightEMA = indicators['3EMA'] > indicators['8EMA'];
  const priceGreaterThanVWAP = price > indicators['VWAP'];
  const arrayChecker = (arr, target) => target.every(v => arr.includes(v));
  const requiredIndicators = ['3EMA', '8EMA', 'VWAP'];
  const indicatorsKeys = Object.keys(indicators);

  if (arrayChecker(requiredIndicators, indicatorsKeys)) {
    if (
      (buySide && threeEMAGreaterThanEightEMA) ||
      (sellSide && !threeEMAGreaterThanEightEMA)
    ) {
      EMAIcon = checkMark;
    }
    if (
      (buySide && priceGreaterThanVWAP) ||
      (sellSide && !priceGreaterThanVWAP)
    ) {
      VWAPIcon = checkMark;
    }
  }

  return (
    <>
      <div>
        3/8 EMA 
        {EMAIcon}
      </div>
      <div>
        3EMA: {indicators['3EMA']?.toFixed(2)}
      </div>
      <div>
        8EMA: {indicators['8EMA']?.toFixed(2)}
      </div>
      <div>
        VWAP: {indicators['VWAP']?.toFixed(2)}
        {VWAPIcon}
      </div>
    </>
  );
}

Indicators.propTypes = {
  socket: PropTypes.object.isRequired,
  symbol: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  side: PropTypes.string.isRequired
};

Indicators.defaultProps = {
  socket: {},
  symbol: '',
  price: 0,
  side: ''
};
