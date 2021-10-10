const express = require('express');
const app = express();
const http = require('http').createServer(app);
const port = process.env.PORT || 5000;
const io = require('socket.io')(http, {
  cors: { origins: ['http://localhost:3000'] }
});
require('dotenv').config();
const Alpaca = require("@alpacahq/alpaca-trade-api");
const alpaca = require('./alpaca');
const indicators = require('./indicators');

const alpacaInstance = new Alpaca({
  keyId: process.env.ALPACA_API_KEY,
  secretKey: process.env.ALPACA_API_SECRET,
  feed: "sip",
  paper: true
});

// for getLatestQuote
// const alpacaConfig = {
//   baseUrl: "https://data.alpaca.markets",
//   keyId: process.env.ALPACA_API_KEY,
//   secretKey: process.env.ALPACA_API_SECRET  
// };

const alpacaSocket = alpacaInstance.data_stream_v2;
const alpacaTradeSocket = alpacaInstance.trade_ws;

io.on('connection', (socket) => {
  if (!alpacaSocket.conn) {
    alpacaSocket.connect();
  }

  alpacaTradeSocket.connect();
  console.log('connected');

  socket.on('disconnect', () => {
    if (alpacaSocket.conn) {
      alpacaSocket.disconnect();
    }
    alpacaTradeSocket.disconnect();
    console.log('disconnected');
  });

  alpacaTradeSocket.onConnect(() => {
    const tradeKeys = ['trade_updates', 'account_updates'];
    alpacaTradeSocket.subscribe(tradeKeys);
  });

  alpacaTradeSocket.onOrderUpdate(data => {
    console.log(`Order updates: ${JSON.stringify(data)}`)
    const event = data.event;
    const symbol = data.order.symbol;
  
    if (symbol && (event === 'new')) {
      io.emit(`${symbol} newOrderResponse`, data);
    }
    if (symbol && (event === 'canceled')) {
      alpaca.getPositions(alpacaInstance, io, alpacaSocket);
      alpaca.getOrders(alpacaInstance, io);
      io.emit(`${symbol} canceledOrderResponse`, data);
      io.emit('canceledOrderResponse', data);
    }
    if (symbol && (event === 'fill')) {
      alpaca.getPositions(alpacaInstance, io, alpacaSocket);
      alpaca.getOrders(alpacaInstance, io);

      const positionQuantity = data.position_qty;
      if (positionQuantity !== "0") {
        io.emit(`${symbol} fillOrderResponse`, data);
      }
      io.emit('fillOrderResponse', data);
    }
  });

  alpacaTradeSocket.onAccountUpdate(data => {
    console.log(`Account updates: ${JSON.stringify(data)}`)
  });

  alpacaSocket.onConnect(() => {
    alpaca.getWatchlist(alpacaInstance, alpacaSocket, io);
    alpaca.getPositions(alpacaInstance, io, alpacaSocket);
    alpaca.getOrders(alpacaInstance, io);
    alpaca.getAssets(alpacaInstance, io);
  });
  
  alpacaSocket.onStockQuote((quote) => {
    io.emit('stockQuoteResponse', quote);
  });

  alpacaSocket.onStockBar((barObj) => {
    // stock bar data once a minute
    console.log('stockBarResponse', barObj);
    // 8 EMA
    indicators.calculateEMA(barObj, 8, alpacaInstance, io);
    // 3 EMA
    indicators.calculateEMA(barObj, 3, alpacaInstance, io);
    indicators.getVWAP(barObj, io);
  });

  alpacaSocket.onError((error) => {
    const message = error.message;
    console.log('error', message);
    io.emit('errorResponse', message);
  });

  socket.on('createOrder', (orderObject) => {
    console.log('createOrder request', orderObject);
    alpaca.createOrder(alpacaInstance, orderObject, io);
  });

  socket.on('addToWatchlist', (symbol) => {
    // getLatestQuote does not get accurate data
    // alpaca.getLatestQuote(alpacaInstance, io, symbol);
    alpaca.addToWatchlist(alpacaInstance, symbol);
    alpacaSocket.subscribeForQuotes([symbol]);
  });

  socket.on('removeFromQuotesAndWatchlist', (symbol) => {
    alpacaSocket.unsubscribeFromQuotes([symbol]);
    alpaca.deleteFromWatchlist(alpacaInstance, symbol);
  });

  socket.on('removeFromWatchlist', (symbol) => {
    alpaca.deleteFromWatchlist(alpacaInstance, symbol);
  });

  socket.on('cancelOrder', (orderId) => {
    alpaca.cancelOrder(alpacaInstance, orderId);
  });

  socket.on('getSMA', (symbol, currentPrice) => {
    // need to add time period as a variable here
    // indicators.calculateSMA(symbol, currentPrice, alpacaInstance, io);
  });
});

http.listen(port, () => console.log(`Listening on port ${port}`));
