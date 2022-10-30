const { config } = require("dotenv");

config();

module.exports = {
  PORT: +(process.env.PORT || "8000"),
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  MONGO_URI: process.env.MONGO_URI,
};
