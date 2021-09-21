import { useEffect, useState } from "react";

export default function ProfitLoss({ socket }) {
  const [portfolioHistory, setPortfolioHistory] = useState({});

  useEffect(() => {
    socket.on('portfolioHistoryResponse', (obj) => {
      setPortfolioHistory(obj);
    });
  }, [socket]);

  let profitLoss = 0;
  let badgeClass = "badge bg-success fs-6 text"; 
  if (Object.keys(portfolioHistory).length > 0) {
    profitLoss = portfolioHistory.profit_loss[0];
    if (profitLoss < 0) {
      badgeClass = "badge bg-danger fs-6 text";
    }
  } 

  return (
    <div>
      <span className="p-2"><strong>Daily P/L:</strong></span>
      <span className={badgeClass}>{profitLoss}</span>
    </div>
  );
}
