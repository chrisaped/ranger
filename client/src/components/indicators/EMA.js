import { useEffect } from "react";
import PropTypes from 'prop-types';

export default function EMA({ socket, symbol, period, addIndicator, indicators }) {
  const EMAName = `${period}EMA`;

  useEffect(() => {
    socket.on(`${symbol} ${EMAName}`, (data) => {
      addIndicator(EMAName, data);
    });   
  }, []) // eslint-disable-line

  return (
    <>
      {indicators.EMAName && (
        <div>
          {`${EMAName}: ${indicators.EMAName}`}
        </div>
      )}
    </>
  );
}

EMA.propTypes = {
  socket: PropTypes.object.isRequired,
  symbol: PropTypes.string.isRequired,
  period: PropTypes.number.isRequired,
  addIndicator: PropTypes.func.isRequired,
  indicators: PropTypes.shape({
    EMAName: PropTypes.number
  })
};

EMA.defaultProps = {
  socket: {},
  symbol: '',
  period: 0,
  indicators: {}
};
