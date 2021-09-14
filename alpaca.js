module.exports = {
  getWatchlist: async function (alpacaInstance, io, alpacaSocket) {
    const response = await alpacaInstance.getWatchlist(process.env.ALPACA_WATCHLIST_ID);
    const symbolsArray = response?.assets?.map(obj => obj.symbol) || [];
    console.log('getWatchlist', symbolsArray);
    io.emit('watchlistResponse', symbolsArray);
    alpacaSocket.subscribeForQuotes(symbolsArray);
  },
  addToWatchlist: async function (alpacaInstance, io, symbol) {
    const response = await alpacaInstance.addToWatchlist(process.env.ALPACA_WATCHLIST_ID, symbol);
    const symbolsArray = response?.assets?.map(obj => obj.symbol) || [];
    if (symbolsArray.length > 0) {
      console.log('addToWatchlist', symbolsArray);
      io.emit('watchlistResponse', symbolsArray);
    }
  },
  updateWatchlist: async function (alpacaInstance, io, symbols) {
    const body = { symbols: symbols };
    const response = await alpacaInstance.updateWatchlist(process.env.ALPACA_WATCHLIST_ID, body);
    const symbolsArray = response?.assets?.map(obj => obj.symbol) || [];
    console.log('updateWatchlist', symbolsArray);
    io.emit('watchlistResponse', symbolsArray);
  },
  getPositions: async function (alpacaInstance, io) {
    const response = await alpacaInstance.getPositions();
    const symbolsArray = response?.assets?.map(obj => obj.symbol) || [];
    console.log('getPositions', symbolsArray);
    io.emit('getPositionsResponse', symbolsArray);
  }
}
