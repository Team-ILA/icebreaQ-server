import express from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { passwordValidator } from "../lib/password-validator/password-validator";
import { emailValidator } from "../lib/email-validator/email-validator";
import { logger } from "../lib/logger/logger";

export interface IUser {
  email: string;
  username: string;
}

declare module "express-session" {
  interface SessionData {
    user?: IUser;
  }
}

const userRouter = express.Router();

userRouter.get("/", (req, res) => {
  if (req.session.user) {
    const { email, username } = req.session.user;
    res.status(200).send({ email, username });
  } else {
    res.status(401).send();
  }
});

userRouter.post(
  "/register",
  [
    body("email").isString(),
    body("username").isString(),
    body("password").isString(),
  ],
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ errors: errors.array() });
    }
    try {
      const { email, username, password } = req.body;

      const isValidEmail = emailValidator.validate(email);
      const isValidPassword = passwordValidator.validate(password);

      const validationErrors: {
        email?: string;
        password?: string;
      } = {};

      if (!isValidEmail) validationErrors.email = "Invalid Email";
      if (!isValidPassword) validationErrors.password = "Invalid Password";

      if (!isValidEmail || !isValidPassword) {
        res.status(400).send({ errors: validationErrors });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const duplicateUser = await User.findOne({ email: email });
      if (duplicateUser) {
        throw new Error("409");
      }

      const newUser = new User({
        email,
        username,
        password: hashedPassword,
      });

      await newUser.save();
      logger.log("INFO", `${email}, ${username} has joined`);
      req.session.user = { email, username };
      res.status(201).json({ message: "created", email, username });
    } catch (err) {
      next(err);
    }
  },
);

userRouter.post(
  "/login",
  [body("email").isString(), body("password").isString()],
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) {
        throw new Error("400");
      }

      const { username, password: hashedPassword } = user;

      const isCorrectPassword = await bcrypt.compare(password, hashedPassword);

      if (!isCorrectPassword) {
        throw new Error("400");
      }

      const userInfo = { email, username };
      logger.log("INFO", `${email}, ${username} has logged in`);
      req.session.user = userInfo;
      res.status(201).send(userInfo);
    } catch (err) {
      next(err);
    }
  },
);

userRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw new Error("500");
  });

  res.clearCookie("connect.sid");
  res.status(200).send();
});

export default userRouter;
