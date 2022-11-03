const { config } = require("dotenv");

config();

module.exports = {
  PORT: +(process.env.PORT || "8000"),
  MONGO_USER: process.env.MONGO_USER,
  MONGO_PASSWORD: process.env.MONGO_PASSWORD,
  MONGO_HOST: process.env.MONGO_HOST,
  SHA256_SECRET: process.env.SHA256_SECRET,
};
