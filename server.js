const express = require("express");
const app = express();
const http = require("http").createServer(app);
const port = process.env.PORT || 5000;
const io = require("socket.io")(http, {
  cors: { origins: ["http://localhost:2000"] },
});
require("dotenv").config();
const AlpacaTradeApi = require("@alpacahq/alpaca-trade-api");
const alpaca = require("./alpaca");
const rangerApi = require("./rangerApi");

const isPaper = process.env.IS_PAPER;
let alpacaApiKey = process.env.ALPACA_API_KEY;
let alpacaApiSecret = process.env.ALPACA_API_SECRET;
let alpacaWatchlistId = process.env.ALPACA_WATCHLIST_ID;

if (isPaper) {
  alpacaApiKey = process.env.PAPER_ALPACA_API_KEY;
  alpacaApiSecret = process.env.PAPER_ALPACA_API_SECRET;
  alpacaWatchlistId = process.env.PAPER_ALPACA_WATCHLIST_ID;
}

const alpacaInstance = new AlpacaTradeApi({
  keyId: alpacaApiKey,
  secretKey: alpacaApiSecret,
  feed: "sip",
  paper: isPaper,
});
const alpacaSocket = alpacaInstance.data_stream_v2;
const alpacaTradeSocket = alpacaInstance.trade_ws;

const establishInitialConnections = (io) => {
  alpaca.getWatchlist(alpacaInstance, alpacaSocket, io, alpacaWatchlistId);
  rangerApi.getPositions(io, alpacaSocket);
  rangerApi.getTotalProfitOrLossToday(io);
  alpaca.getAssets(alpacaInstance, io);
  alpaca.getAccount(alpacaInstance, io);
};

io.on("connection", (socket) => {
  if (!alpacaSocket.conn) {
    alpacaSocket.connect();
  }

  alpacaTradeSocket.connect();
  console.log("connected");

  socket.on("disconnect", () => {
    if (alpacaSocket.conn) {
      alpacaSocket.disconnect();
    }
    alpacaTradeSocket.disconnect();
    console.log("disconnected");
  });

  alpacaTradeSocket.onConnect(() => {
    const tradeKeys = ["trade_updates", "account_updates"];
    alpacaTradeSocket.subscribe(tradeKeys);
  });

  alpacaTradeSocket.onOrderUpdate((data) => {
    console.log(`Order update: ${JSON.stringify(data)}`);
    const event = data.event;
    const symbol = data.order.symbol;

    if (symbol && event === "new") {
      io.emit(`${symbol} newOrderResponse`, data);
    }
    if (symbol && event === "canceled") {
      rangerApi.getPositions(io, alpacaSocket);
      io.emit("canceledOrderResponse", data);
    }
    if (symbol && event === "fill") {
      rangerApi.createOrder(data, io, alpacaSocket);

      const positionQuantity = data.position_qty;
      if (positionQuantity === "0") {
        alpacaSocket.unsubscribeFromQuotes([symbol]);
      } else {
        io.emit(`${symbol} fillOrderResponse`, data);
      }

      io.emit("fillOrderResponse", data);
    }
  });

  alpacaTradeSocket.onAccountUpdate((data) => {
    console.log(`Account updates: ${JSON.stringify(data)}`);
  });

  alpacaSocket.onConnect(() => {
    establishInitialConnections(io);
  });

  alpacaSocket.onStockQuote((quote) => {
    io.emit("stockQuoteResponse", quote);
  });

  alpacaSocket.onError((error) => {
    console.log("error", error);
    io.emit("errorResponse", error);
  });

  socket.on("createOrder", (orderObject) => {
    console.log("createOrder", orderObject);
    alpaca.createOrder(alpacaInstance, orderObject, io);
  });

  socket.on("createNewOrder", (orderObject) => {
    console.log("createNewOrder", orderObject);
    rangerApi.createPosition(orderObject);
    alpaca.createOrder(alpacaInstance, orderObject, io);
  });

  socket.on("addToWatchlist", (symbol) => {
    console.log("addToWatchlist", symbol);
    alpaca.addToWatchlist(alpacaInstance, symbol, alpacaWatchlistId);
    alpacaSocket.subscribeForQuotes([symbol]);
  });

  socket.on("removeFromQuotesAndWatchlist", (symbol) => {
    console.log("removeFromQuotesAndWatchlist", symbol);
    alpacaSocket.unsubscribeFromQuotes([symbol]);
    alpaca.deleteFromWatchlist(alpacaInstance, symbol, alpacaWatchlistId);
  });

  socket.on("removeFromWatchlist", (symbol) => {
    console.log("removeFromWatchlist", symbol);
    alpaca.deleteFromWatchlist(alpacaInstance, symbol, alpacaWatchlistId);
  });

  socket.on("cancelOrder", (orderObj) => {
    console.log("cancelOrder", orderObj);
    const { orderId, symbol, cancelPosition } = orderObj;
    alpaca.cancelOrder(alpacaInstance, orderId);
    if (cancelPosition) rangerApi.cancelPosition(symbol);
  });
});

http.listen(port, () => console.log(`Listening on port ${port}`));
