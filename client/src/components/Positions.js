import { useEffect, useState } from "react";
import PositionsTable from "./PositionsTable";

export default function Positions({ socket }) {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    socket.on("getPositionsResponse", (array) => {
      setPositions(array);
    });
  }, [socket]);

  return (
    <div>
      <h2>Positions</h2>
      {positions.length > 0 ? (
        <div>
          <PositionsTable socket={socket} positions={positions} />
        </div>
      ):(
        <div>
          <p>There are no open positions.</p>
        </div>
      )}
    </div>
  );
}
