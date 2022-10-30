import express from "express";
import mongoose from "mongoose";
import config from "./config";

const app = express();
const port = config.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(
    `mongodb+srv://${config.DB_USER}:${config.DB_PASSWORD}@${config.MONGO_URI}`,
  )
  .then(() => console.log("connection successful"))
  .catch((e) => console.error(e));

import userRouter from "./routes/userRouter";
import quizRouter from "./routes/quizRouter";

app.use("/user", userRouter);
app.use("/quiz", quizRouter);

app.listen(port, () => {
  console.log(`listening to port ${port}!`);
});
