const axios = require("axios").default;

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 1000,
});

module.exports = {
  fetchPositionState: async function (orderData) {
    const response = await axiosInstance.post(
      "/fetch_position_state",
      orderData
    );
    console.log("here is the positionState", response.data);
  },
};
