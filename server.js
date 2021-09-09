const express = require('express');
const app = express();
const http = require('http').createServer(app);
const port = process.env.PORT || 5000;
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://localhost:3000']
  }
});

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
const alpacaDataStream = require('./AlpacaDataStream').AlpacaDataStream;

// app.post('/alpaca_data_stream', (req, res) => {
//   console.log('here is the request', req);
//   console.log('it works!', stream);
//   res.send({ dataStream: stream });
// })

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('my message', (msg) => {
    console.log('here is the message', msg);
    // console.log('here is the symbols array', symbols_array_string);
    let stream = new alpacaDataStream(['GME']);
    io.emit('my broadcast', stream);
  });
});

http.listen(port, () => console.log(`Listening on port ${port}`));
