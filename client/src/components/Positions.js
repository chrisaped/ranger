import { useEffect, useState } from "react";
import PositionsTable from "./PositionsTable";

export default function Positions({ socket, quotes }) {
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    socket.on("getPositionsResponse", (array) => {
      setPositions(array);
    });

    socket.on("getOrdersResponse", (array) => {
      setOrders(array);
    });
  }, [socket]);

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
