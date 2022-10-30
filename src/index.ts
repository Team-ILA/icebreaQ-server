import express from "express";
import mongoose from "mongoose";
import Dotenv from "dotenv";
// import config from "../config";

Dotenv.config();
const { DB_USER, DB_PASSWORD, MONGO_URI } = process.env;

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@${MONGO_URI}`)
  .then(() => console.log("connection successful"))
  .catch((e) => console.error(e));

// app.use('/users', usersRouter)
// app.use('/quizzes', quizRouter)

app.listen(port, () => {
  console.log(`listening to port ${port}!`);
});
