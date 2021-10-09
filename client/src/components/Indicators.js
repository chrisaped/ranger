import { useState, useEffect } from "react";
import PropTypes from 'prop-types';

export default function Indicators({ socket, symbol, barObj }) {
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
