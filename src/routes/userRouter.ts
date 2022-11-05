import express from "express";
import User from "../models/user";
import bcrypt from "bcrypt";

declare module "express-session" {
  interface SessionData {
    user: string;
  }
}

const userRouter = express.Router();

userRouter.post("/register", async (req, res, next) => {
  // email validation(optional)
  try {
    // try: error를 내는 부분
    const { email, username, password } = req.body; // request의 body에서 email, username, password를 꺼내 구조분해 할당

    const hashedPassword = await bcrypt.hash(password, 10);

    const duplicateUser = await User.findOne({ email: email });
    if (!duplicateUser) {
      throw new Error("400");
    }

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "created", email, username });
  } catch (err) {
    // try문에서 던진 error를 catch해서 next()로  내보냄
    next(err);
  }
});

userRouter.post("/login", async (req, res, next) => {
  try {
    // try: error를 내는 부분
    const { email, username, password } = req.body; // request의 body에서 email, username, password를 꺼내 구조분해 할당
    // email, hash(password)로 몽고디비에서 find
    // 없다면 throw new Error('400');
    const exuser = await User.findOne({ email: email });
    if (!exuser) {
      throw new Error("400");
    }
    const result = await bcrypt.compare(password, exuser.password);
    if (!result) {
      throw new Error("400");
    }
    req.session.user = email;

    res.status(201).send({ email, username: exuser.username });
  } catch (err) {
    // try문에서 던진 error를 catch해서 next()로  내보냄
    next(err);
  }
  // 있다면,
  // 몽고디비에서 받아온 데이터를 이용,
  // req.session.user = email
  // 로 user 저장 (보통 email을 저장하진 않는데 편의를 위해 이렇게 진행해도 될 것 같습니다.)

  // 추후 front가 완성되면 res.redirect() 등으로 메인페이지로 redirect
  // res.status(200).send();
});

userRouter.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
  });

  // 추후 front가 완성되면 res.redirect() 등으로 메인페이지로 redirect
  // res.status(200).send();
});
export default userRouter;
