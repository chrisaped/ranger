import { useState } from "react";

export default function Search({ socket, setSearchSymbol }) {
  const [searchParams, setSearchParams] = useState('');

  const getStockQuote = () => {
    setSearchSymbol(searchParams);
    socket.emit('getStockQuote', searchParams);
  }

  const handleChange = (e) => {
    const params = e.target.value;
    setSearchParams(params.toUpperCase());
  }

  return (
    <div className="d-flex justify-content-center">
      <div className="d-inline-flex">
        <input 
          className="form-control m-2"
          type="text" 
          placeholder="Symbol" 
          value={searchParams} 
          onChange={handleChange} 
        />
        <button 
          className="btn btn-primary m-2" 
          onClick={getStockQuote}
          disabled={!searchParams}
        >
          Search
        </button>
      </div>
    </div>
  );
}
