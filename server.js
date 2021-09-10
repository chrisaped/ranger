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

// const stream = {
//   T: 'q',
//   Symbol: 'GME',
//   BidExchange: 'H',
//   BidPrice: 196.53,
//   BidSize: 1,
//   AskExchange: 'T',
//   AskPrice: 196.92,
//   AskSize: 1,
//   Condition: [ 'R' ],
//   Tape: 'A',
//   Timestamp: '2021-09-08T18:18:06.708Z'
// }

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    if (alpacaSocket.conn) {
      alpacaSocket.disconnect();
    }
    console.log('user disconnected');
  });

  socket.on('my message', (msg) => {
    console.log('here is the message', msg);

    alpacaSocket.connect();

    alpacaSocket.onConnect(function () {
      console.log("Connected");
      alpacaSocket.subscribeForQuotes(['GME']);
    });

    alpacaSocket.onStockQuote((quote) => {
      console.log('here is the quote', quote);
      io.emit('my broadcast', quote);
    });
  });
});

http.listen(port, () => console.log(`Listening on port ${port}`));
