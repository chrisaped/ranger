const axios = require("axios").default;

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 1000,
});

module.exports = {
  createPosition: async function (orderObject) {
    const response = await axiosInstance.post("/create_position", orderObject);
    console.log("here is the createPosition response", response);
  },
  createOrder: async function (orderData) {
    const response = await axiosInstance.post("/create_order", orderData);
    console.log("here is the createOrder response", response);
  },
  getPositions: async function (io) {
    const response = await axiosInstance.get("/get_positions");
    console.log("here is the getPositions response", response);
    io.emit("getPositionsResponse", response);
  },
};
