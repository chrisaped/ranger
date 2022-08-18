const axios = require("axios").default;

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 1000,
});

module.exports = {
  createPosition: async function (orderObject) {
    const response = await axiosInstance.post("/create_position", orderObject);
    console.log("here is the new position", response.data);
  },
  createOrder: async function (orderData) {
    const response = await axiosInstance.post("/create_order", orderData);
    console.log("here are the positions", response.data);
  },
};
