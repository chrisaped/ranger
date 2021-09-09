export const searchComponent = ({ searchParams, _searchResult, setSearchParams }) => (
  <div>
    <h1>Search</h1>
    <input 
      type="text" 
      placeholder="Symbol" 
      onChange={(e) => setSearchParams(e.target.value)} 
      value={searchParams} 
    />
    <p>{`${searchParams}`}</p>
  </div>
);
