import express from "express";
// import Quiz from "../models/quiz";

const router = express.Router();

router.use((req, res, next) => {
  next();
});

router.get("/", (req, res) => {
  res.send("get response");
});

router.post("/", (req, res) => {
  res.send("post response");
});

export default router;
