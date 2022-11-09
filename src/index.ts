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

type QuizInfo = {
  current_question: {
    questionNum: number;
    content: string;
  };
  answers: string[];
  title: string;
  creator: string;
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
  socket.on("greeting", async (data: any) => {
    const { userId, quizId, nickname } = data;

    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      throw new Error("404");
    }

    if (quiz.limit <= quiz.active_users.length) {
      socket.disconnect();
    }

    // quidId 값에 알맞는 room에 입장(join)
    await socket.join(quizId);
    socket.nickname = nickname;
    socket.quizId = quizId;
    console.log(socket.quizId);

    await Quiz.updateOne(
      { quizId },
      { $set: { active_users: [...quiz.active_users, nickname] } },
    );

    const quizInfo: QuizInfo = {
      current_question: {
        questionNum: quiz.current_question + 1,
        content: quiz.QA[quiz.current_question].question,
      },
      answers: quiz.QA[quiz.current_question].answer,
      title: quiz.title,
      creator: quiz.creator,
    };

    io.to(quizId).emit("greeting_response", quizInfo);
  });

  socket.on("disconnecting", async () => {
    const quizId = socket.quizId;
    const nickname = socket.nickname;

    if (!quizId) {
      throw new Error("400");
    }

    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      throw new Error("404");
    }

    await Quiz.updateOne({ quizId }, { $pull: { active_users: nickname } });

    io.to(quizId).emit("leave", { activeUsers: quiz.active_users });
  });

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

  socket.on("join-room", (userData) => {
    const { roomID, userID } = userData;
    socket.join(roomID);
    socket.broadcast.to(roomID).emit("new-user-connect", userData);
    socket.on("disconnect", () => {
      socket.broadcast.to(roomID).emit("user-disconnected", userID);
    });
    socket.on("broadcast-message", (message) => {
      socket.broadcast
        .to(roomID)
        .emit("new-broadcast-messsage", { ...message, userData });
    });
    // socket.on('reconnect-user', () => {
    //     socket.broadcast.to(roomID).emit('new-user-connect', userData);
    // });
    socket.on("display-media", (value) => {
      socket.broadcast.to(roomID).emit("display-media", { userID, value });
    });
    socket.on("user-video-off", (value) => {
      socket.broadcast.to(roomID).emit("user-video-off", value);
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
