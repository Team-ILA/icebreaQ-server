import express from "express";
// import Quiz from "../models/quiz";

const quizRouter = express.Router();

quizRouter.use((req, res, next) => {
  // authentiction session checking middleware
  next();
});

quizRouter.get("/", (req, res) => {
  res.send("get response");
});

quizRouter.post("/", (req, res) => {
  res.send("post response");
});

export default quizRouter;
