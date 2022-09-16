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
  createOrder: async function (orderData) {
    const response = await axiosInstance.post("/create_order", orderData);
    console.log("createOrder response", response.status);
  },
  getPositions: async function (io, alpacaSocket) {
    const response = await axiosInstance.get("/get_positions");
    console.log("getPositions response", response.data);
    io.emit("getPositionsResponse", response.data);

    const symbolsArray = response.data.map((obj) => obj.symbol) || [];
    if (symbolsArray.length > 0) {
      alpacaSocket.subscribeForQuotes(symbolsArray);
    }
  },
  getTotalProfitOrLossToday: async function (io) {
    const response = await axiosInstance.get("/get_total_profit_or_loss_today");
    console.log("getTotalProfitOrLossToday response", response.data);
    io.emit("getTotalProfitOrLossTodayResponse", response.data);
  },
};
