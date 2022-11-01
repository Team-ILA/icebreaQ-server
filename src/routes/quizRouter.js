import express from "express";
import Quiz from "../models/quiz";
import crypto from "crypto";
import config from "../config";

const quizRouter = express.Router();

quizRouter.use((req, res, next) => {
  // authentiction session checking middleware
  next();
});

quizRouter.post("/", async (req, res) => {
  const { creator, questions } = req.body;

  const quizId = crypto
    .createHmac("sha256", config.SHA256_SECRET)
    .update(questions.join())
    .digest("hex");

  const duplicateQuiz = await Quiz.findOne({ quizId });
  if (duplicateQuiz !== null) {
    throw new Error("400");
  }

  const QA = questions.map((item) => {
    return {
      question: item,
      answer: [],
    };
  });

  const newQuiz = new Quiz({
    quizId,
    creator,
    QA,
    current_question: 0,
    active_users: [],
  });

  try {
    await newQuiz.save();
  } catch (e) {
    throw new Error(e);
  }

  res.status(201).json({ quizId });
});

quizRouter.get("/:quizId", async (req, res) => {
  const { quizId } = req.params;

  const dbResponse = await Quiz.findOne({ quizId });

  if (dbResponse === null) {
    throw new Error();
  }

  res.status(200).json(dbResponse);
});

quizRouter.put("/:quizId", async (req, res) => {
  // express에서 req schema 확인하는 방법 찾아봐야 함 : quizID가 존재하지 않는 경우
  const { quizId } = req.params;

  const quiz = await Quiz.findOne({ quizId });

  if (quiz === null) {
    throw new Error("404");
  }

  const { current_question, QA } = quiz;

  if (current_question >= QA.length) {
    throw new Error("400");
  }

  await Quiz.updateOne(
    { quizId },
    {
      $inc: { current_question: 1 },
    },
  );

  res.status(200).send("update complete");
});

export default quizRouter;
