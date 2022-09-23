module.exports = {
  getWatchlist: async function (
    alpacaInstance,
    alpacaSocket,
    io,
    alpacaWatchlistId
  ) {
    const response = await alpacaInstance.getWatchlist(alpacaWatchlistId);
    const symbolsArray = response?.assets?.map((obj) => obj.symbol) || [];
    console.log("getWatchlist response", symbolsArray);
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
      console.log("addToWatchlist response", symbolsArray);
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
    console.log("deleteFromWatchlist response", symbolsArray);
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
  getNewOrders: async function (alpacaInstance, io) {
    const today = new Date().toISOString().slice(0, 10);
    const orderObj = {
      status: "new",
      after: today,
    };
    const responseArray = await alpacaInstance.getOrders(orderObj);
    console.log("getNewOrdersResponse", responseArray);

    if (responseArray.length > 0) {
      const newOrdersObj = {};
      responseArray.forEach((orderObj) => {
        newOrdersObj[orderObj.symbol] = orderObj;
      });

      io.emit("getNewOrdersResponse", newOrdersObj);
    }
  },
  getAssets: async function (alpacaInstance, io) {
    const responseArray = await alpacaInstance.getAssets({ status: "active" });

    if (responseArray.length > 0) {
      const assetsObj = {};
      responseArray.forEach((assetObj) => {
        assetsObj[assetObj.symbol] = assetObj;
      });

      io.emit("getAssetsResponse", assetsObj);
    }
  },
  cancelOrder: async function (alpacaInstance, orderId) {
    const response = await alpacaInstance.cancelOrder(orderId);
    console.log("cancelOrderResponse", response);
  },
  createOrder: async function (
    alpacaInstance,
    orderObject,
    io,
    isNewOrder = false
  ) {
    if ("stop_price" in orderObject) delete orderObject.stop_price;

    const response = await alpacaInstance.createOrder(orderObject);
    console.log("createOrderResponse", response);

    if (isNewOrder) {
      const symbol = response.symbol;
      io.emit(`${symbol} createNewOrderResponse`, response);
    }
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
  getLatestTrade: async function (alpacaInstance, io, symbol) {
    const response = await alpacaInstance.getLatestTrade(symbol);
    io.emit(`${symbol} getLatestTradeResponse`, response);
  },
};
