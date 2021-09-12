import { useEffect, useState } from "react";

export default function Positions({ socket }) {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    socket.emit("getPositions");

    socket.on("getPositionsResponse", (symbolsArray) => {
      setPositions(symbolsArray);
    });
  }, [socket]);

  return (
    <div>
      <h2>Positions</h2>
      {positions.length > 0 ? (
        <div>
          <p>{`${positions}`}</p>
        </div>
      ):(
        <div>
          <p>There are no open positions.</p>
        </div>
      )}
    </div>
  );
}
