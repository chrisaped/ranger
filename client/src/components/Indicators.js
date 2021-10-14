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

  const EMA3 = indicators['3EMA'];
  const EMA8 = indicators['8EMA'];
  const VWAP = indicators['VWAP'];
  let EMAIcon = xMark;
  let VWAPIcon = xMark;
  const buySide = side === 'buy' || side === 'long';
  const sellSide = side === 'sell' || side === 'short';
  const threeEMAGreaterThanEightEMA = EMA3 > EMA8;
  const priceGreaterThanVWAP = price > VWAP;
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
      {EMA3 && EMA8 && VWAP && (
        <div>
          <div>
            3/8 EMA 
            {EMAIcon}
          </div>
          <div>
            VWAP: {VWAP}
            {VWAPIcon}
          </div>
        </div>
      )}
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
