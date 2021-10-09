import { useState, useEffect } from "react";
import PropTypes from 'prop-types';

export default function Indicators({ socket, symbol, barObj }) {
  // 5 min indicators needed: VWAP, 3 EMA, 8 EMA
  // vwap does not need to be calculated since it is included in alpaca bars data

  const [SMA, setSMA] = useState(0);

  useEffect(() => {
    socket.emit('getSMA', symbol, barObj?.c);

    socket.on(`${symbol} SMA`, (data) => {
      setSMA(data);
    });
  }, []); // eslint-disable-line

  return (
    <div>
      {`SMA: ${SMA}`}
    </div>
  );
}

Indicators.propTypes = {
  socket: PropTypes.object.isRequired
};

Indicators.defaultProps = {
  socket: {}
};
