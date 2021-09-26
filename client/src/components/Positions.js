import PositionsTable from "./PositionsTable";

export default function Positions({ socket, quotes, orders, positions }) {
  return (
    <div>
      <div className="d-flex justify-content-center">
        <h2>Positions</h2>
      </div>
      {positions.length > 0 ? (
        <div>
          <PositionsTable 
            socket={socket} 
            positions={positions} 
            orders={orders}
            quotes={quotes}
          />
        </div>
      ):(
        <div className="d-flex justify-content-center m-3">
          <p>There are no open positions.</p>
        </div>
      )}
    </div>
  );
}
