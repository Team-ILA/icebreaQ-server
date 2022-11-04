import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import mongoose from "mongoose";
import config from "./config";

import Quiz from "./models/quiz";
import apiRouter from "./routes/apiRouter";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // 제출 전에 변경 필요할 듯
    credentials: true,
  },
});

const port = config.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(
    `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}`,
  )
  .then(() => console.log("connection successful"))
  .catch((e) => console.error(e));

app.use("/api", apiRouter);

io.on("connection", (socket: Socket) => {
  socket.on("greeting", async (data: any) => {
    const { quizId, nickname } = data;

    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      throw new Error("404");
    }

    // quidId 값에 알맞는 room에 입장(join)
    await socket.join(quizId);

    await Quiz.updateOne(
      { quizId },
      { $set: { active_users: [...quiz.active_users, nickname] } },
    );

    io.to(quizId).emit("greeting_response", {
      roomMembers: [...quiz.active_users, nickname],
    });
  });

  socket.on("leave", async (data: any) => {
    const { quizId, nickname } = data;

    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      throw new Error("404");
    }

    await Quiz.updateOne({ quizId }, { $pull: { active_users: nickname } });
  });

  socket.on("new_answer", async (data: any) => {
    const { quizId, newAnswer } = data;

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
});

app.use((err: any, req: any, res: any, next: any) => {
  const { message } = err;
  console.error(err);
  res.status(parseInt(message)).json({ status: "error occurred" });
});

httpServer.listen(port, () => {
  console.log(`listening to port ${port}!`);
});
