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
    alpaca.getWatchlist(alpacaInstance, io, alpacaSocket);
    alpaca.getPositions(alpacaInstance, io);
  });
  
  alpacaSocket.onStockQuote((quote) => {
    console.log(quote);
    io.emit('stockQuoteResponse', quote);
  });

  alpacaSocket.onStockTrade((trade) => {
    console.log(trade);
    io.emit('getPositionsResponse', trade);
  });

  // socket.on('createOrder', (orderObject) => {
  //   alpacaInstance.createOrder(orderObject).then((order) => {
  //     console.log('here is the order', order);
  //   });
    // remove symbol in order object from watchlist
  // });

  socket.on('addToWatchlist', (symbol) => {
    alpaca.addToWatchlist(alpacaInstance, symbol);
    alpacaSocket.disconnect();
    alpacaSocket.connect();
  });
});

http.listen(port, () => console.log(`Listening on port ${port}`));
