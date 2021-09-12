import { useEffect, useState } from "react";

export default function Watchlist({ socket }) {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    socket.on("watchlistResponse", (symbolsArray) => {
      setWatchlist(symbolsArray);
    });
  }, [socket]);

  return (
    <div>
      <h2>Watchlist</h2>
      <p>{`${watchlist}`}</p>
    </div>
  );
}
