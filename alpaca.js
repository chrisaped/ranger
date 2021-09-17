module.exports = {
  getWatchlist: async function (alpacaInstance, alpacaSocket, io) {
    const response = await alpacaInstance.getWatchlist(process.env.ALPACA_WATCHLIST_ID);
    const symbolsArray = response?.assets?.map(obj => obj.symbol) || [];
    io.emit('getWatchlist', symbolsArray);
    if (symbolsArray.length > 0) {
      alpacaSocket.subscribeForQuotes(symbolsArray);
    }
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
  getPositions: async function (alpacaInstance, io, alpacaSocket) {
    const response = await alpacaInstance.getPositions();
    const symbolsArray = response?.map(obj => obj.symbol) || [];
    if (symbolsArray.length > 0) {
      alpacaSocket.subscribeForQuotes(symbolsArray);
      io.emit('getPositionsResponse', response);
    }
  },
  getOrders: async function (alpacaInstance, io) {
    const response = await alpacaInstance.getOrders();
    console.log('getOrders', response);
    io.emit('getOrdersResponse', response);
  }
}
