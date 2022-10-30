import express from "express";
// import User from "../models/user";

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
