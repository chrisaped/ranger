module.exports = {
  getWatchlist: async function (alpacaInstance, alpacaSocket, io) {
    const response = await alpacaInstance.getWatchlist(process.env.ALPACA_WATCHLIST_ID);
    const symbolsArray = response?.assets?.map(obj => obj.symbol) || [];
    io.emit('getWatchlist', symbolsArray);
    if (symbolsArray.length > 0) {
      alpacaSocket.subscribeForQuotes(symbolsArray);
      alpacaSocket.subscribeForBars(symbolsArray);
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
      alpacaSocket.subscribeForBars(symbolsArray);
    }
    io.emit('getPositionsResponse', response);
  },
  getOrders: async function (alpacaInstance, io) {
    const today = new Date().toISOString().slice(0, 10);
    const orderObj = { status: 'all', after: today, nested: true, direction: 'asc' };
    const response = await alpacaInstance.getOrders(orderObj);
    io.emit('getOrdersResponse', response);
  },
  getAssets: async function (alpacaInstance, io) {
    const response = await alpacaInstance.getAssets({ status: 'active' });
    const assetsObject = () => {
      const newObj = {};
      response.forEach((assetObj) => {
        newObj[assetObj.symbol] = assetObj;
      });
      return newObj;
    }
    io.emit('getAssetsResponse', assetsObject());
  },
  cancelOrder: async function (alpacaInstance, orderId) {
    const response = await alpacaInstance.cancelOrder(orderId);
    console.log('cancelOrder', response);
  },
  getLatestQuote: async function (alpacaInstance, io, symbol) {
    // this does not work yet
    // const response = await alpacaInstance.getLatestQuote(symbol, alpacaConfig);
    const response = await alpacaInstance.lastQuote(symbol);
    io.emit('getLatestQuoteResponse', response);
  },
  createOrder: async function (alpacaInstance, orderObject, _io) {
    const response = await alpacaInstance.createOrder(orderObject);
    console.log('createOrder', response);
    // emit error here
  },
  getBars: async function (symbol, alpacaInstance, startDate, endDate) {
    const barsObj = {
      start: startDate,
      end: endDate,
      timeframe: "1Day"
    };

    const response = await alpacaInstance.getBarsV2(
      symbol, barsObj, alpacaInstance.configuration
    );
    console.log('getBarsResponse', response);

    const barsArray = response?.bars;
    if (!barsArray) {
      return [];
    }
    
    const closingPrices = [];
    barsArray.forEach(barObj => {
      closingPrices.push(barObj.c)
    });

    return closingPrices;
  }
}
