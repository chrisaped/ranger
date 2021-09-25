import { useEffect, useState } from "react";

export default function ProfitLoss({ socket, orders, positions }) {
  useEffect(() => {
  }, [socket]);

  let profitLoss = 0;
  let badgeClass = "badge bg-success fs-6 text"; 
  
  if (profitLoss < 0) {
    badgeClass = "badge bg-danger fs-6 text";
  }

  return (
    <>
    {profitLoss !== 0 && (
      <div>
        <span className="p-2"><strong>Daily P/L:</strong></span>
        <span className={badgeClass}>{profitLoss}</span>
      </div>
    )}
    </>
  );
}
