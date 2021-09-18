export default function WatchlistList({ watchlist, deleteFromWatchlist }) {
  return (
    <div className="w-25">
      <ul className="list-group">
      {watchlist.map(symbol => {
        return (
          <li 
            key={symbol} 
            className="list-group-item d-flex justify-content-around align-items-center"
          >
            <strong>{symbol}</strong>
            <button 
              className="btn btn-secondary btn-sm m-2" 
              onClick={() => deleteFromWatchlist(symbol)}
            >
              Remove
            </button>
          </li>
        );
      })}
      </ul>
    </div>
  );
}
