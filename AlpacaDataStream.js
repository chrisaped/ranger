"use strict"

require('dotenv').config()
const Alpaca = require("@alpacahq/alpaca-trade-api");

class AlpacaDataStream {
  constructor(symbols_array) {
    this.alpaca = new Alpaca({
      keyId: process.env.ALPACA_API_KEY,
      secretKey: process.env.ALPACA_API_SECRET,
      feed: "sip",
      paper: true
    });

    const socket = this.alpaca.data_stream_v2;

    socket.onConnect(function () {
      console.log("Connected");
      socket.subscribeForQuotes(symbols_array);
    });

    socket.onError((err) => {
      console.log(err);
    });

    socket.onStockTrade((trade) => {
      console.log(trade);
    });

    socket.onStockQuote((quote) => {
      console.log(quote);
    });

    socket.onStockBar((bar) => {
      console.log(bar);
    });

    socket.onStatuses((s) => {
      console.log(s);
    });

    socket.onStateChange((state) => {
      console.log(state);
    });

    socket.onDisconnect(() => {
      console.log("Disconnected");
    });

    socket.connect();

    // disconnect after 5 seconds
    setTimeout(() => {
      socket.disconnect();
    }, 10000);
  }
}

module.exports = { AlpacaDataStream }
