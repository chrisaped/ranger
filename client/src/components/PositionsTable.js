export default function PositionsTable({ socket, positions }) {
  const createOrderObject = (symbol, qty) => {
    return (
      {
        "side": "sell",
        "symbol": symbol,
        "type": "market",
        "qty": `${qty}`,
        "time_in_force": "day"
      }
    );
  };

  const createOrder = (orderObject) => {
    socket.emit('createOrder', orderObject);
  };
  
  return (
    <table className="table table-bordered">
      <thead className="table-dark">
        <tr>
          <th>Symbol</th>
          <th>Side</th>
          <th>Current Price</th>
          <th>Target Price</th>
          <th>Stop Price</th>
          <th>Entry Price</th>
          <th>Shares</th>
          <th>Cost</th>
          <th>P/L</th>
          <th colSpan="1">Actions</th>
        </tr>
      </thead>
      <tbody>
      {positions.map((positionObj, index) => {
        const {
          symbol,
          side,
          current_price,
          avg_entry_price,
          qty,
          cost_basis,
          unrealized_intraday_pl
        } = positionObj;

        const orderObject = createOrderObject(symbol, qty);

        return (
          <tr key={index}>
            <td><strong>{symbol}</strong></td>
            <td>{side}</td>
            <td>{current_price}</td>
            <td>Target Price</td>
            <td>Stop Price</td>
            <td>{avg_entry_price}</td>
            <td>{qty}</td>
            <td>{cost_basis}</td>
            <td>{unrealized_intraday_pl}</td>
            <td>
              <button 
                className="btn btn-dark m-2" 
                onClick={() => createOrder(orderObject)}
                // disabled= if I dont have enough money
              >
                Sell
              </button>
            </td>            
          </tr>
        );
      })}
      </tbody>
    </table>
  );
}
