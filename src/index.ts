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
    origin: "*",
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

io.on("connection", (socket: Socket) => {
  socket.on("greeting", async (data: any) => {
    const { quizId, nickname } = data;

    const quiz = await Quiz.findOne({ quizId });

    if (quiz === (undefined || null)) {
      throw new Error("404");
    }

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

    if (quiz === (undefined || null)) {
      throw new Error("404");
    }

    const removeIndex = quiz.active_users.indexOf(nickname);
    if (removeIndex === -1) {
      throw new Error();
    }

    await Quiz.updateOne({ quizId }, { $pull: { active_users: nickname } });
  });

  socket.on("new_answer", async (data: any) => {
    const { quizId, newAnswer } = data;

    const quiz = await Quiz.findOne({ quizId });

    if (quiz === (undefined || null)) {
      throw new Error("404");
    }

    const currentQuestion = quiz.current_question;
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

app.use("/api", apiRouter);

app.use((err: any, req: any, res: any, next: any) => {
  const { message } = err;
  console.error(err);
  res.status(parseInt(message)).send("error occurred");
});

httpServer.listen(port, () => {
  console.log(`listening to port ${port}!`);
});
