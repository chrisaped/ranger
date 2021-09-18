export default function WatchlistTable({ watchlist, deleteFromWatchlist }) {
  return (
    <table className="table table-bordered">
      <thead className="table-dark">
        <tr>
          <th>Symbol</th>
          <th colSpan="1">Actions</th>
        </tr>
      </thead>
      <tbody>
      {watchlist.map(symbol => {
        return (
          <tr key={symbol}>
            <td><strong>{symbol}</strong></td>
            <td>
              <button 
                className="btn btn-secondary m-2" 
                onClick={() => deleteFromWatchlist(symbol)}
              >
                Remove
              </button>
            </td>            
          </tr>
        );
      })}
      </tbody>
    </table>
  );
}
