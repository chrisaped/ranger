export default function SearchResult({ quote }) {
  const {
    Symbol,
    AskPrice
  } = quote;

  return (
    <div>
      <table className="table table-bordered">
        <tbody>
          <tr>
            <td><strong>{Symbol}</strong></td>
            <td>${AskPrice}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
