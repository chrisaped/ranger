const axios = require("axios").default;

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 1000,
});

module.exports = {
  createPosition: async function (orderObject) {
    const response = await axiosInstance.post("/create_position", orderObject);
    console.log("createPosition response", response.status);
  },
  cancelPosition: async function (symbol) {
    const response = await axiosInstance.put("/cancel_position", {
      symbol: symbol,
    });
    console.log("cancelPosition response", response.status);
  },
  createOrder: async function (orderData, io, alpacaSocket) {
    const response = await axiosInstance.post("/create_order", orderData);
    const statusCode = response.status;
    console.log("createOrder response", statusCode);
    if (statusCode === 201) {
      this.getTotalProfitOrLossToday(io);
      this.getOpenPositions(io, alpacaSocket);
      this.getPendingPositions(io);
    }
  },
  getOpenPositions: async function (io, alpacaSocket) {
    const response = await axiosInstance.get("/open_positions");
    console.log("getOpenPositions response", response.data);
    io.emit("getOpenPositionsResponse", response.data);

    const symbolsArray = response.data.map((obj) => obj.symbol) || [];
    if (symbolsArray.length > 0) {
      alpacaSocket.subscribeForQuotes(symbolsArray);
    }
  },
  getPendingPositions: async function (io) {
    const response = await axiosInstance.get("/pending_positions");
    const responseArray = response.data;
    console.log("getPendingPositions response", responseArray);

    if (responseArray.length > 0) {
      const positionsObj = {};
      responseArray.forEach((positionObj) => {
        positionsObj[positionObj.symbol] = positionObj;
      });

      io.emit("getPendingPositionsResponse", positionsObj);
    }
  },
  getTotalProfitOrLossToday: async function (io) {
    const response = await axiosInstance.get("/total_profit_or_loss_today");
    console.log("getTotalProfitOrLossToday response", response.data);
    io.emit("getTotalProfitOrLossTodayResponse", response.data);
  },
};
