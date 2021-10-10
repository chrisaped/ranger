import { useEffect } from "react";
import PropTypes from 'prop-types';

export default function VWAP({ socket, symbol, addIndicator, indicators }) {
  useEffect(() => {
    socket.on(`${symbol} VWAP`, (data) => {
      addIndicator('VWAP', data);
    });   
  }, []) // eslint-disable-line

  return (
    <>
      {indicators.VWAP && (
        <div>
          {`VWAP: ${indicators.VWAP}`}
        </div>
      )}
    </>
  );
}

VWAP.propTypes = {
  socket: PropTypes.object.isRequired,
  symbol: PropTypes.string.isRequired,
  addIndicator: PropTypes.func.isRequired,
  indicators: PropTypes.shape({
    VWAP: PropTypes.number
  })
};

VWAP.defaultProps = {
  socket: {},
  symbol: '',
  indicators: {}
};
