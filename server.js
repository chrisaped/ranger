const express = require('express');
const app = express();
const http = require('http').createServer(app);
const port = process.env.PORT || 5000;
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://localhost:3000']
  }
});
require('dotenv').config();
const Alpaca = require("@alpacahq/alpaca-trade-api");
const alpaca = require('./alpaca');

const alpacaInstance = new Alpaca({
  keyId: process.env.ALPACA_API_KEY,
  secretKey: process.env.ALPACA_API_SECRET,
  feed: "sip",
  paper: true
});

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
    if (['filled', 'canceled'].includes(data.event)) {
      alpaca.getClock(alpacaInstance, io);
      alpaca.getOrders(alpacaInstance, io);
      alpaca.getPositions(alpacaInstance, io, alpacaSocket);
      io.emit('orderUpdateResponse', data);
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
    alpaca.getClock(alpacaInstance, io);
  });
  
  alpacaSocket.onStockQuote((quote) => {
    io.emit('stockQuoteResponse', quote);
  });

  // this does not work with the current api
  // alpacaSocket.onOrderUpdate((order) => {
  //   console.log('onOrderUpdate', order);
  // });

  alpacaSocket.onError((err) => {
    console.log(err);
  });

  socket.on('createOrder', (orderObject) => {
    console.log('here is the orderObject', orderObject);
    alpacaInstance.createOrder(orderObject);
    alpaca.getOrders(alpacaInstance, io);
    alpaca.getPositions(alpacaInstance, io, alpacaSocket);
  });

  socket.on('addToWatchlist', (symbol) => {
    alpaca.addToWatchlist(alpacaInstance, symbol);
    alpacaSocket.subscribeForQuotes([symbol]);
  });

  socket.on('deleteFromWatchlist', (symbol) => {
    alpacaSocket.unsubscribeFromQuotes([symbol]);
    alpaca.deleteFromWatchlist(alpacaInstance, symbol);
  });

  socket.on('cancelOrder', (orderId) => {
    alpaca.cancelOrder(alpacaInstance, orderId);
  });
});

http.listen(port, () => console.log(`Listening on port ${port}`));
