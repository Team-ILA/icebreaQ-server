import express from "express";
// import User from "../models/user";

const userRouter = express.Router();

userRouter.get("/", (req, res) => {
  res.send("get response");
});

userRouter.post("/", (req, res) => {
  res.send("post response");
});

export default userRouter;
