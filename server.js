const express = require('express');
const app = express();
const http = require('http').createServer(app);
const port = process.env.PORT || 5000;
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://localhost:3000']
  }
});
const alpacaDataStream = require('./AlpacaDataStream').AlpacaDataStream;

app.post('/alpaca_data_stream', (req, res) => {
  console.log('here is the request', req);
  let stream = new alpacaDataStream(['GME']);
  console.log('it works!', stream);
  res.send({ dataStream: stream });
})

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(port, () => console.log(`Listening on port ${port}`));