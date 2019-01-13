const axios = require("axios");
const adapter = require("axios/lib/adapters/http");

module.exports = axios.create({
  adapter
});
