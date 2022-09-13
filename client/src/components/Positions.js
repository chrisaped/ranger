import PropTypes from "prop-types";
import PositionsTable from "./PositionsTable";

export default function Positions({ socket, quotes, positions }) {
  return (
    <div>
      {positions.length > 0 && (
        <div>
          <div className="d-flex justify-content-center">
            <h2>Positions</h2>
          </div>
          <PositionsTable
            socket={socket}
            quotes={quotes}
            positions={positions}
          />
        </div>
      )}
    </div>
  );
}

Positions.propTypes = {
  socket: PropTypes.object.isRequired,
  quotes: PropTypes.object.isRequired,
  positions: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string,
      side: PropTypes.string,
      avg_entry_price: PropTypes.string,
      qty: PropTypes.string,
    })
  ).isRequired,
};

Positions.defaultProps = {
  socket: {},
  quotes: {},
  positions: [],
};
