import { useEffect, useState } from "react";

export default function Positions({ socket }) {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    socket.on("getPositionsResponse", (symbolsArray) => {
      setPositions(symbolsArray);
    });
  }, [socket]);

  return (
    <div>
      <h2>Positions</h2>
      <p>{`${positions}`}</p>
    </div>
  );
}
