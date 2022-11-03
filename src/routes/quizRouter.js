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
  try {
    const { creator, questions } = req.body;

    const quizId = crypto
      .createHmac("sha256", config.SHA256_SECRET)
      .update(questions.join())
      .digest("hex");

    const duplicateQuiz = await Quiz.findOne({ quizId });
    if (duplicateQuiz !== undefined) {
      return next(new Error("400"));
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

    await newQuiz.save();

    res.status(201).json({ quizId });
  } catch (err) {
    if (err) {
      next(err);
    }
  }
});

quizRouter.get("/:quizId", async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const dbResponse = await Quiz.findOne({ quizId });

    if (dbResponse === (undefined || null)) {
      return next(new Error("404"));
    }

    res.status(200).json(dbResponse);
  } catch (err) {
    if (err) {
      next(err);
    }
  }
});

quizRouter.put("/:quizId", async (req, res) => {
  try {
    // express에서 req schema 확인하는 방법 찾아봐야 함 : quizID가 존재하지 않는 경우
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({ quizId });

    if (quiz === undefined) {
      return next(new Error("404"));
    }

    const { current_question, QA } = quiz;

    if (current_question >= QA.length) {
      return next(new Error("404"));
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
