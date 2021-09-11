import { useState } from "react";

export default function Search({ socket, quoteData }) {
  const [searchParams, setSearchParams] = useState('');

  const getStockQuote = () => {
    socket.emit('getStockQuote', searchParams);
  }

  const handleChange = (e) => {
    const params = e.target.value;
    setSearchParams(params.toUpperCase());
  }

  return (
    <div>
      <div className="d-inline-flex">
        <input 
          className="form-control m-2"
          type="text" 
          placeholder="Symbol" 
          value={searchParams} 
          onChange={handleChange} 
        />
        <button className="btn btn-primary m-2" onClick={getStockQuote}>Search</button>
      </div>
      {Object.keys(quoteData).length > 0 && (
        <div>
          <p>{`${quoteData?.Symbol}: ${quoteData?.AskPrice}`}</p>
        </div>
      )}
    </div>
  );
}
