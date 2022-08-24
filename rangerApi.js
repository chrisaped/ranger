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
  createOrder: async function (orderData, io) {
    const response = await axiosInstance.post("/create_order", orderData);
    console.log("createOrder response", response.status);
    this.getPositions(io);
  },
  getPositions: async function (io) {
    const response = await axiosInstance.get("/get_positions");
    console.log("here is the getPositions response", response.data);
    io.emit("getPositionsResponse", response.data);
  },
};
