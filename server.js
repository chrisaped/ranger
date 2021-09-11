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

  alpacaSocket.onConnect(() => {
    alpacaInstance.getPositions().then((positions) => {
      console.log('here are the positions', positions);
      alpacaSocket.subscribeForQuotes(positions);
    })
  });
  
  alpacaSocket.onStockQuote((quote) => {
    io.emit('stockQuoteResponse', quote);
  });
  
  socket.on('getStockQuote', (symbol) => {
    const symbolsArray = symbol.toUpperCase().split(',');
    const message = { quotes: symbolsArray };
    alpacaSocket.updateSubscriptions(message);
  });

  socket.on('disconnect', () => {
    if (alpacaSocket.conn) {
      alpacaSocket.disconnect();
    }
    console.log('disconnected');
  });
});

http.listen(port, () => console.log(`Listening on port ${port}`));
