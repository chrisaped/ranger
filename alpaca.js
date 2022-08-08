const indicators = require("./indicators");

module.exports = {
  getWatchlist: async function (
    alpacaInstance,
    alpacaSocket,
    io,
    alpacaWatchlistId
  ) {
    const response = await alpacaInstance.getWatchlist(alpacaWatchlistId);
    const symbolsArray = response?.assets?.map((obj) => obj.symbol) || [];
    io.emit("getWatchlist", symbolsArray);
    if (symbolsArray.length > 0) {
      alpacaSocket.subscribeForQuotes(symbolsArray);
      alpacaSocket.subscribeForBars(symbolsArray);
    }
  },
  addToWatchlist: async function (alpacaInstance, symbol, alpacaWatchlistId) {
    const response = await alpacaInstance.addToWatchlist(
      alpacaWatchlistId,
      symbol
    );
    const symbolsArray = response?.assets?.map((obj) => obj.symbol) || [];
    if (symbolsArray.length > 0) {
      console.log("addToWatchlist", symbolsArray);
    }
  },
  deleteFromWatchlist: async function (
    alpacaInstance,
    symbol,
    alpacaWatchlistId
  ) {
    const response = await alpacaInstance.deleteFromWatchlist(
      alpacaWatchlistId,
      symbol
    );
    const symbolsArray = response?.assets?.map((obj) => obj.symbol) || [];
    console.log("deleteFromWatchlist", symbolsArray);
  },
  getPositions: async function (alpacaInstance, io, alpacaSocket) {
    const response = await alpacaInstance.getPositions();
    const symbolsArray = response?.map((obj) => obj.symbol) || [];
    if (symbolsArray.length > 0) {
      alpacaSocket.subscribeForQuotes(symbolsArray);
      alpacaSocket.subscribeForBars(symbolsArray);
    }
    io.emit("getPositionsResponse", response);
  },
  getOrders: async function (alpacaInstance, io) {
    const today = new Date().toISOString().slice(0, 10);
    const orderObj = {
      status: "all",
      after: today,
      nested: true,
      direction: "asc",
    };
    const response = await alpacaInstance.getOrders(orderObj);
    io.emit("getOrdersResponse", response);
  },
  getAssets: async function (alpacaInstance, io) {
    const response = await alpacaInstance.getAssets({ status: "active" });
    const assetsObject = () => {
      const newObj = {};
      response.forEach((assetObj) => {
        newObj[assetObj.symbol] = assetObj;
      });
      return newObj;
    };
    io.emit("getAssetsResponse", assetsObject());
  },
  cancelOrder: async function (alpacaInstance, orderId) {
    const response = await alpacaInstance.cancelOrder(orderId);
    console.log("cancelOrder", response);
  },
  getSnapshot: async function (alpacaInstance, io, symbol) {
    const response = await alpacaInstance.getSnapshot(
      symbol,
      alpacaInstance.configuration
    );

    const quote = { Symbol: symbol, AskPrice: response.LatestQuote.AskPrice };
    io.emit("stockQuoteResponse", quote);

    const barObj = response.MinuteBar;
    barObj["Symbol"] = symbol;
    indicators.calculateIndicators(barObj, alpacaInstance, io, this);
  },
  createOrder: async function (alpacaInstance, orderObject, _io) {
    const response = await alpacaInstance.createOrder(orderObject);
    console.log("createOrder", response);
    // emit error here
  },
  getBars: async function (symbol, alpacaInstance, startDate, endDate) {
    const barsObj = {
      start: startDate,
      end: endDate,
      timeframe: "5Min",
      limit: 100,
    };

    const bars = await alpacaInstance.getBarsV2(
      symbol,
      barsObj,
      alpacaInstance.configuration
    );

    const barsData = {
      open: [],
      close: [],
      high: [],
      low: [],
      volume: [],
    };

    for await (let bar of bars) {
      barsData.open.push(bar.OpenPrice);
      barsData.close.push(bar.ClosePrice);
      barsData.high.push(bar.HighPrice);
      barsData.low.push(bar.LowPrice);
      barsData.volume.push(bar.Volume);
    }

    return barsData;
  },
  getAccount: async function (alpacaInstance, io) {
    const response = await alpacaInstance.getAccount();
    io.emit("getAccountResponse", response);
  },
};
