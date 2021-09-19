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

io.on('connection', (socket) => {
  if (!alpacaSocket.conn) {
    alpacaSocket.connect();
  }
  console.log('connected');

  socket.on('disconnect', () => {
    if (alpacaSocket.conn) {
      alpacaSocket.disconnect();
    }
    console.log('disconnected');
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
});

http.listen(port, () => console.log(`Listening on port ${port}`));
