const axios = require("axios").default;

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 1000,
});

module.exports = {
  processPosition: async function (orderData) {
    const response = await axiosInstance.post("/process_position", orderData);
    console.log(response.data);
  },
};
