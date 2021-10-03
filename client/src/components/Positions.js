import PropTypes from 'prop-types';
import PositionsTable from "./PositionsTable";

export default function Positions({ socket, quotes, orders, positions }) {
  return (
    <div>
      {positions.length > 0 && (
        <div>
          <div className="d-flex justify-content-center">
            <h2>Positions</h2>
          </div>
          <PositionsTable 
            socket={socket} 
            positions={positions} 
            orders={orders}
            quotes={quotes}
          />
        </div>
      )}
    </div>
  );
}

Positions.propTypes = {
  socket: PropTypes.object.isRequired,
  quotes: PropTypes.object.isRequired,
  orders: PropTypes.arrayOf(PropTypes.shape({
    symbol: PropTypes.string,
    filled_qty: PropTypes.number,
    filled_avg_price: PropTypes.number,
    status: PropTypes.string,
    legs: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string,
      limit_price: PropTypes.number,
      id: PropTypes.string,
      status: PropTypes.string,
      stop_price: PropTypes.number
    }))
  })).isRequired,
  positions: PropTypes.arrayOf(PropTypes.shape({
    symbol: PropTypes.string,
    side: PropTypes.string,
    avg_entry_price: PropTypes.number,
    qty: PropTypes.number
  })).isRequired  
};

Positions.defaultProps = {
  socket: {},
  quotes: {},
  orders: [],
  positions: []
};
