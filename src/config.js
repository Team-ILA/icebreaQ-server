const { config } = require("dotenv");

config();

module.exports = {
  PORT: +(process.env.PORT || "8000"),
  MONGO_USER: process.env.MONGO_USER,
  MONGO_PASSWORD: process.env.MONGO_PASSWORD,
  MONGO_HOST: process.env.MONGO_HOST,
  MONGO_NAME: process.env.MONGO_NAME,
  SHA256_SECRET: process.env.SHA256_SECRET,
  SESSION_KEY: process.env.SESSION_KEY || "1234",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "",
  MONGO_PROTOCOL: process.env.IS_MONGO_ATLAS ? "mongodb+srv" : "mongodb",
};
