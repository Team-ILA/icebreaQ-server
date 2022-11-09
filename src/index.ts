import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

import {
  ALLOWED_ORIGINS,
  MONGO_HOST,
  MONGO_NAME,
  MONGO_PASSWORD,
  MONGO_PROTOCOL,
  MONGO_USER,
  PORT,
  SESSION_KEY,
} from "./config";
import Quiz from "./models/quiz";
import apiRouter from "./routes/apiRouter";
import session from "express-session";

type UserDetail = {
  userId: string;
  quizId: string;
  username: string;
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // 제출 전에 변경 필요할 듯
    credentials: true,
  },
});

const corsOptions = {
  origin: ALLOWED_ORIGINS.split(","),
  credentials: true,
};

app.use(cors(corsOptions));
app.use(
  session({
    secret: SESSION_KEY,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(
    `${MONGO_PROTOCOL}://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}/${MONGO_NAME}`,
  )
  .then(() => console.log("connection successful"))
  .catch((e) => console.error(e));

app.use("/api", apiRouter);
interface ISocket extends Socket {
  nickname?: string;
  quizId?: string;
}

io.on("connection", (socket: ISocket) => {
  socket.on("new_answer", async (data: any) => {
    const quizId = socket.quizId;
    const { newAnswer } = data;

    if (!quizId) {
      throw new Error("400");
    }

    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      throw new Error("404");
    }

    const currentQuestion = quiz?.current_question;
    if (currentQuestion === undefined) {
      throw new Error();
    }

    await Quiz.updateOne(
      { quizId },
      { $push: { [`QA.${currentQuestion}.answer`]: newAnswer } },
    );

    io.to(quizId).emit("answer_submitted", {
      updatedAnswer: [...quiz.QA[currentQuestion].answer, newAnswer],
    });
  });

  socket.on("join_room", (userData: UserDetail) => {
    const { userId, quizId } = userData;
    socket.join(quizId);
    socket.broadcast.to(quizId).emit("new_user_connected", userData);
    socket.on("disconnect", () => {
      socket.broadcast.to(quizId).emit("user_disconnected", userId);
    });
  });
});

app.use((err: any, req: any, res: any, next: any) => {
  const { message } = err;
  console.error(err);
  res.status(parseInt(message)).json({ status: "error occurred" });
  next();
});

httpServer.listen(PORT, () => {
  console.log(`listening to port ${PORT}!`);
});
