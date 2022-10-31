import express from "express";

import userRouter from "./userRouter";
import quizRouter from "./quizRouter";

const apiRouter = express.Router();

apiRouter.use("/user", userRouter);
apiRouter.use("/quiz", quizRouter);

export default apiRouter;
