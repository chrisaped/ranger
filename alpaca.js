module.exports = {
  getWatchlist: async function (alpacaInstance, io, alpacaSocket) {
    const response = await alpacaInstance.getWatchlist(process.env.ALPACA_WATCHLIST_ID);
    const symbolsArray = response?.assets?.map(obj => obj.symbol) || [];
    console.log('getWatchlist', symbolsArray);
    alpacaSocket.subscribeForQuotes(symbolsArray);
  },
  addToWatchlist: async function (alpacaInstance, symbol) {
    const response = await alpacaInstance.addToWatchlist(process.env.ALPACA_WATCHLIST_ID, symbol);
    const symbolsArray = response?.assets?.map(obj => obj.symbol) || [];
    if (symbolsArray.length > 0) {
      console.log('addToWatchlist', symbolsArray);
    }
  },
  deleteFromWatchlist: async function (alpacaInstance, symbol) {
    const response = await alpacaInstance.deleteFromWatchlist(process.env.ALPACA_WATCHLIST_ID, symbol);
    const symbolsArray = response?.assets?.map(obj => obj.symbol) || [];
    console.log('deleteFromWatchlist', symbolsArray);
  },
  updateWatchlist: async function (alpacaInstance, io, symbols) {
    const body = { symbols: symbols };
    const response = await alpacaInstance.updateWatchlist(process.env.ALPACA_WATCHLIST_ID, body);
    const symbolsArray = response?.assets?.map(obj => obj.symbol) || [];
    console.log('updateWatchlist', symbolsArray);
  },
  getPositions: async function (alpacaInstance, io) {
    const response = await alpacaInstance.getPositions();
    console.log('getPositions', response);
    io.emit('getPositionsResponse', response);
  }
}
