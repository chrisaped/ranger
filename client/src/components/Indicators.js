import { useState } from "react";
import PropTypes from 'prop-types';
import EMA from "./indicators/EMA";
import VWAP from "./indicators/VWAP";
import { updateObjectState } from "../shared/state";

export default function Indicators({ socket, symbol }) {
  const [indicators, setIndicators] = useState({});

  const addIndicator = (indicator, value) => {
    updateObjectState(setIndicators, indicator, value);
  };

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
  symbol: PropTypes.string.isRequired
};

Indicators.defaultProps = {
  socket: {},
  symbol: ''
};
