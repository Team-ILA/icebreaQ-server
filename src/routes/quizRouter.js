import express from "express";
import Quiz from "../models/quiz";
import crypto from "crypto";
import config from "../config";

const quizRouter = express.Router();

quizRouter.use((req, res, next) => {
  if (req.session.user) {
    req.user = req.session.user;
    next();
  } else {
    next(new Error("401"));
  }
});

quizRouter.post("/", async (req, res, next) => {
  try {
    const { questions } = req.body;

    const quizId = crypto
      .createHmac("sha256", config.SHA256_SECRET)
      .update(questions.join())
      .digest("hex");

    const duplicateQuiz = await Quiz.findOne({ quizId });
    if (duplicateQuiz) {
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
      creator: req.session.user,
      QA,
      current_question: 0,
      active_users: [],
    });

    await newQuiz.save();

    res.status(201).json({ quizId });
  } catch (err) {
    next(err);
  }
});

quizRouter.get("/:quizId", async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const dbResponse = await Quiz.findOne({ quizId });

    if (!dbResponse) {
      throw new Error("404");
    }

    res.status(200).json(dbResponse);
  } catch (err) {
    next(err);
  }
});

quizRouter.put("/:quizId", async (req, res, next) => {
  try {
    // express에서 req schema 확인하는 방법 찾아봐야 함 : quizID가 존재하지 않는 경우
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      throw new Error("404");
    }

    const { current_question, QA } = quiz;

    if (current_question >= QA.length) {
      throw new Error("404");
    }

    await Quiz.updateOne(
      { quizId },
      {
        $inc: { current_question: 1 },
      },
    );

    res.status(200).send("update complete");
  } catch (err) {
    next(err);
  }
});

export default quizRouter;
