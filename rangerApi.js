const axios = require("axios").default;

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 1000,
});

module.exports = {
  createPosition: async function () {
    const response = await axiosInstance.get("/create_position");
    console.log(response.data);
  },
};
