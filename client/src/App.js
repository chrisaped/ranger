import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Search from "./components/Search";
import ProfitLoss from "./components/ProfitLoss";
import Positions from "./components/Positions";
import Watchlist from "./components/Watchlist";
import Alert from "./components/Alert";
import { updateObjectState } from "./shared/state";

export default function App() {
  const [socket, setSocket] = useState(null);
  const [quotes, setQuotes] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  const [tradeableAssets, setTradeableAssets] = useState({});
  const [positions, setPositions] = useState([]);
  const [alert, setAlert] = useState({});
  const [displayAlert, setDisplayAlert] = useState(false);
  const [accountInfo, setAccountInfo] = useState({});

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_ENDPOINT);
    setSocket(newSocket);

    newSocket.on("stockQuoteResponse", (quote) => {
      const { Symbol, AskPrice, BidPrice } = quote;
      addQuote(Symbol, AskPrice, BidPrice);
    });

    newSocket.on("getAssetsResponse", (assets) => {
      setTradeableAssets(assets);
    });

    newSocket.on("getPositionsResponse", (array) => {
      setPositions(array);
    });

    newSocket.on("getAccountResponse", (accountObj) => {
      setAccountInfo(accountObj);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const addQuote = (symbol, askPrice, bidPrice) => {
    const priceObj = { ask: askPrice, bid: bidPrice };
    updateObjectState(setQuotes, symbol, priceObj);
  };

  const accountSize = Math.round(accountInfo?.buying_power).toLocaleString();

  return (
    <>
      {socket ? (
        <div className="container">
          <div className="row">
            <div className="col">
              <Alert
                socket={socket}
                alert={alert}
                setAlert={setAlert}
                displayAlert={displayAlert}
                setDisplayAlert={setDisplayAlert}
              />
            </div>
            <div className="col">
              <Search
                socket={socket}
                watchlist={watchlist}
                setWatchlist={setWatchlist}
                tradeableAssets={tradeableAssets}
                positions={positions}
                setAlert={setAlert}
                setDisplayAlert={setDisplayAlert}
              />
            </div>
            <div className="col d-flex justify-content-around align-items-center">
              <div>
                Account Size: <strong>${accountSize}</strong>
              </div>
              <ProfitLoss
                positions={positions}
                quotes={quotes}
                socket={socket}
              />
            </div>
          </div>
          <div className="row">
            <Watchlist
              socket={socket}
              quotes={quotes}
              setQuotes={setQuotes}
              watchlist={watchlist}
              setWatchlist={setWatchlist}
              tradeableAssets={tradeableAssets}
              accountInfo={accountInfo}
            />
          </div>
          <div className="row">
            <Positions socket={socket} quotes={quotes} positions={positions} />
          </div>
        </div>
      ) : (
        <div>
          <p>Socket connection error.</p>
        </div>
      )}
    </>
  );
}
