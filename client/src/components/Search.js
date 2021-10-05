import { useState } from "react";
import PropTypes from 'prop-types';
import { enableAlert } from "../shared/formatting";

export default function Search({ 
  socket, 
  watchlist, 
  setWatchlist,
  tradeableAssets,
  positions,
  setAlert,
  setDisplayAlert
}) {
  const [searchParams, setSearchParams] = useState('');

  const getStockQuote = () => {
    if (isAnAsset(searchParams)) {
      const newWatchlist = watchlist.concat([searchParams]);
      setWatchlist(newWatchlist);
      socket.emit('addToWatchlist', searchParams);
      setSearchParams('');
    } else {
      setSearchParams('');
      const alertString = 'Not a valid asset';
      enableAlert(alertString, setAlert, setDisplayAlert, true);
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
  })).isRequired,
  setAlert: PropTypes.func.isRequired,
  setDisplayAlert: PropTypes.func.isRequired
};

Search.defaultProps = {
  socket: {}, 
  watchlist: [], 
  tradeableAssets: {},
  positions: []
};
