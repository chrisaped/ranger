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

  // alpacaSocket.onConnect(() => {
  //   let alpacaPositions = [];
  //   let alpacaWatchlist = [];

  //   const allSymbols = [...alpacaPositions, ...alpacaWatchlist];    
  //   alpacaSocket.subscribeForQuotes(allSymbols);
  // });
  
  alpacaSocket.onStockQuote((quote) => {
    io.emit('stockQuoteResponse', quote);
  });
  
  socket.on('getStockQuote', (symbol) => {
    const symbolsArray = symbol.split(',');
    const message = { quotes: symbolsArray };
    alpacaSocket.updateSubscriptions(message);
  });

  socket.on('createOrder', (orderObject) => {
    alpacaInstance.createOrder(orderObject).then((order) => {
      console.log('here is the order', order);
    });
  });

  socket.on('getPositions', () => {
    alpacaInstance.getPositions().then((response) => {
      const symbolsArray = response?.assets?.map(obj => obj.symbol) || [];
      if (symbolsArray.length > 0) {
        io.emit('getPositionsResponse', symbolsArray);
      }
    });    
  });

  socket.on('getWatchlist', () => {
    alpacaInstance.getWatchlist(process.env.ALPACA_WATCHLIST_ID).then((response) => {
      const symbolsArray = response?.assets?.map(obj => obj.symbol) || [];
      if (symbolsArray.length > 0) {
        io.emit('watchlistResponse', symbolsArray);
      }
    });
  });

  socket.on('addToWatchlist', (symbol) => {
    alpacaInstance.addToWatchlist(process.env.ALPACA_WATCHLIST_ID, symbol).then((response) => {
      const symbolsArray = response.assets.map(obj => obj.symbol);
      io.emit('watchlistResponse', symbolsArray);
      const message = { quotes: symbolsArray };
      alpacaSocket.updateSubscriptions(message);
    });
  });
});

http.listen(port, () => console.log(`Listening on port ${port}`));
