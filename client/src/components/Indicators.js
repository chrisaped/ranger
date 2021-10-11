import { useState } from "react";
import PropTypes from 'prop-types';
import EMA from "./indicators/EMA";
import VWAP from "./indicators/VWAP";
import { updateObjectState } from "../shared/state";

export default function Indicators({ 
  socket, 
  symbol, 
  price,
  side
}) {
  const [indicators, setIndicators] = useState({});

  const addIndicator = (indicator, value) => {
    updateObjectState(setIndicators, indicator, value);
  };
  
  const arrayChecker = (arr, target) => target.every(v => arr.includes(v));
  const requiredIndicators = ['3EMA', '8EMA', 'VWAP'];
  const indicatorsKeys = Object.keys(indicators);

  if (arrayChecker(requiredIndicators, indicatorsKeys)) {
    if (side === 'buy') {
      if (
        (indicators['3EMA'] > indicators['8EMA']) &&
        (price > indicators['VWAP'])
      ) {
        // set row color
      }
    } else {
      if (
        (indicators['3EMA'] < indicators['8EMA']) &&
        (price < indicators['VWAP'])
      ) {
        // set row color
      }
    }
  }

  return (
    <>
      <div>
        <EMA 
          socket={socket}
          symbol={symbol}
          period={3}
          addIndicator={addIndicator}
          indicators={indicators}
        />
      </div>
      <div>
        <EMA 
          socket={socket}
          symbol={symbol}
          period={8}
          addIndicator={addIndicator}
          indicators={indicators}
        />
      </div>      
      <div>
        <VWAP 
          socket={socket}
          symbol={symbol}
          addIndicator={addIndicator}
          indicators={indicators}
        />
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
