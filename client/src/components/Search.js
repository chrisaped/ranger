import { useState } from "react";
import PropTypes from 'prop-types';

export default function Search({ 
  socket, 
  watchlist, 
  setWatchlist,
  tradeableAssets,
  positions
}) {
  const [searchParams, setSearchParams] = useState('');
  const [searchError, setSearchError] = useState('');

  const getStockQuote = () => {
    setSearchError('');
    if (isAnAsset(searchParams)) {
      const newWatchlist = watchlist.concat([searchParams]);
      setWatchlist(newWatchlist);
      socket.emit('addToWatchlist', searchParams);
      setSearchParams('');
    } else {
      setSearchParams('');
      setSearchError('Not a valid asset');
    }
  };

  const isAnAsset = searchParams => {
    if (searchParams in tradeableAssets) {
      return true;
    }
    return false;
  };

  const isAPosition = () => {
    const symbolsArray = [];
    positions.forEach(positionObj => {
      symbolsArray.push(positionObj.symbol);
    });
    if (symbolsArray.includes(searchParams)) {
      return true;
    }
    return false;
  }

  const handleChange = e => {
    const params = e.target.value;
    setSearchParams(params.toUpperCase());
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && searchParams) {
      getStockQuote();
    }
  };

  const isDisabled = !searchParams || watchlist.includes(searchParams) || isAPosition();

  return (
    <div>
      <div className="d-flex justify-content-center">
        <div className="d-inline-flex">
          <input 
            className="form-control m-2"
            type="text" 
            placeholder="Symbol" 
            value={searchParams} 
            onChange={handleChange}
            onKeyPress={handleKeyPress} 
          />
          <button 
            className="btn btn-primary m-2" 
            onClick={getStockQuote}
            disabled={isDisabled}
          >
            Search
          </button>
        </div>
      </div>
      {searchError && (
        <div 
          style={{cursor: "pointer"}}
          className="alert alert-danger alert-dismissible fade show p-2 d-flex justify-content-center" 
          role="alert"
          onClick={() => setSearchError('')}
        >
          {searchError}
        </div>
      )}      
    </div>
  );
}

Search.propTypes = {
  socket: PropTypes.object.isRequired,
  watchlist: PropTypes.arrayOf(PropTypes.string).isRequired, 
  setWatchlist: PropTypes.func.isRequired,
  tradeableAssets: PropTypes.object.isRequired,
  positions: PropTypes.arrayOf(PropTypes.shape({
    symbol: PropTypes.string
  })).isRequired
};

Search.defaultProps = {
  socket: {}, 
  watchlist: [], 
  tradeableAssets: {},
  positions: []
};
