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
    origin: "*",
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
    secure: process.env.NODE_ENV === DEPLOYMENT ? true : false,
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
  socket.on("new_answer", async (answer: string, quizId: string) => {
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
      { $push: { [`QA.${currentQuestion}.answer`]: answer } },
    );

    io.to(quizId).emit("answer_submitted", {
      updatedAnswer: [...quiz.QA[currentQuestion].answer, answer],
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

  socket.on("to_next_question", async (quizId: string) => {
    console.log("to-next");
    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      throw new Error("404");
    }

    const { current_question, QA } = quiz;
    console.log(QA.length);

    if (current_question + 1 >= QA.length) {
      throw new Error("404");
    }

    await Quiz.updateOne(
      { quizId },
      {
        $inc: { current_question: 1 },
      },
    );

    const changedQuiz = await Quiz.findOne({ quizId });

    io.to(quizId).emit("quiz_updated", changedQuiz);
  });

  socket.on("to_prev_question", async (quizId: string) => {
    console.log("to-prev");
    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      throw new Error("404");
    }

    const { current_question } = quiz;

    if (current_question <= 0) {
      throw new Error("404");
    }

    console.log(current_question);

    await Quiz.updateOne(
      { quizId },
      {
        $inc: { current_question: -1 },
      },
    );
    console.log(quiz.current_question);

    const changedQuiz = await Quiz.findOne({ quizId });

    io.to(quizId).emit("quiz_updated", changedQuiz);
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
