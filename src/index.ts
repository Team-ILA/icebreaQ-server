import express from "express";
import mongoose from "mongoose";
import config from "./config";

import apiRouter from "./routes/apiRouter";

const app = express();
const port = config.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(
    `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}`,
  )
  .then(() => console.log("connection successful"))
  .catch((e) => console.error(e));

app.use("/api", apiRouter);
app.listen(port, () => {
  console.log(`listening to port ${port}!`);
});
