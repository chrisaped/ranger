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

io.on("connection", (socket) => {
  alpacaSocket.connect();
  alpacaTradeSocket.connect();

  alpaca.getAssets(alpacaInstance, io);

  alpaca.getAccount(alpacaInstance, io);
  alpaca.getNewOrders(alpacaInstance, io);
  rangerApi.getTotalProfitOrLossToday(io);
  rangerApi.getPendingPositions(io);

  alpacaSocket.onConnect(() => {
    console.log("alpacaSocket connected");
    alpaca.getWatchlist(alpacaInstance, alpacaSocket, io, alpacaWatchlistId);
    rangerApi.getOpenPositions(io, alpacaSocket);
  });

  alpacaTradeSocket.onConnect(() => {
    console.log("alpacaTradeSocket connected");
    const tradeKeys = ["trade_updates", "account_updates"];
    alpacaTradeSocket.subscribe(tradeKeys);
  });

  socket.on("disconnect", () => {
    if (alpacaSocket.conn) {
      alpacaSocket.disconnect();
    }
    alpacaTradeSocket.disconnect();
    console.log("disconnected");
  });

  alpacaTradeSocket.onOrderUpdate((data) => {
    console.log(`Order update: ${JSON.stringify(data)}`);
    const event = data.event;
    const symbol = data.order.symbol;

    if (symbol && event === "new") {
      io.emit(`${symbol} newOrderResponse`, data);
    }

    if (symbol && event === "canceled") {
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

      alpaca.getAccount(alpacaInstance, io);
    }
  });

  alpacaTradeSocket.onAccountUpdate((data) => {
    console.log(`Account updates: ${JSON.stringify(data)}`);
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
    alpaca.createOrder(alpacaInstance, orderObject, io, true);
  });

  socket.on("addToWatchlist", (symbol) => {
    console.log("addToWatchlist", symbol);
    alpaca.addToWatchlist(alpacaInstance, symbol, alpacaWatchlistId);
    alpacaSocket.subscribeForQuotes([symbol]);
  });

  socket.on("getLatestTrade", (symbol) => {
    console.log("getLatestTrade", symbol);
    alpaca.getLatestTrade(alpacaInstance, io, symbol);
  });

  socket.on("removeFromQuotesAndWatchlist", (symbol) => {
    console.log("removeFromQuotesAndWatchlist", symbol);
    alpacaSocket.unsubscribeFromQuotes([symbol]);
    alpaca.deleteFromWatchlist(alpacaInstance, symbol, alpacaWatchlistId, io);
  });

  socket.on("removeFromWatchlist", (symbol) => {
    console.log("removeFromWatchlist", symbol);
    alpaca.deleteFromWatchlist(alpacaInstance, symbol, alpacaWatchlistId, io);
  });

  socket.on("cancelOrder", (orderObj) => {
    console.log("cancelOrder", orderObj);
    const { orderId, symbol, cancelPosition } = orderObj;
    alpaca.cancelOrder(alpacaInstance, orderId);
    if (cancelPosition) rangerApi.cancelPosition(symbol);
  });
});

http.listen(port, () => console.log(`Listening on port ${port}`));
