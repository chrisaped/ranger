import { useEffect, useState } from "react";

export default function Watchlist({ socket }) {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    socket.emit('getWatchlist');

    socket.on("watchlistResponse", (symbolsArray) => {
      setWatchlist(symbolsArray);
    });
  }, [socket]);

  return (
    <div>
      <h2>Watchlist</h2>
      {watchlist.length > 0 ? (
        <div>
          <p>{`${watchlist}`}</p>
        </div>
      ):(
        <div>
          <p>The watchlist is empty.</p>
        </div>
      )}
    </div>
  );
}
