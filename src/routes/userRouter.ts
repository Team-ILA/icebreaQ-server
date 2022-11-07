import express from "express";
import User from "../models/user";
import bcrypt from "bcrypt";

declare module "express-session" {
  interface SessionData {
    user: {
      email: string;
      username: string;
    };
  }
}

const userRouter = express.Router();

userRouter.post("/register", async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const duplicateUser = await User.findOne({ email: email });
    if (duplicateUser) {
      throw new Error("400");
    }

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    req.session.user = { email, username };
    res.status(201).json({ message: "created", email, username });
  } catch (err) {
    next(err);
  }
});

userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("400");
    }

    const { username, password: hashedPassword } = user;

    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) {
      throw new Error("400");
    }
    req.session.user = { email, username };

    res.status(201).send({ email, username });
  } catch (err) {
    next(err);
  }
});

userRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw new Error("500");
  });

  res.clearCookie("connect.sid");
  res.status(200).send();
});

export default userRouter;
