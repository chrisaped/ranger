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
