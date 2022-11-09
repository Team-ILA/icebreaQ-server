import express from "express";
import Quiz from "../models/quiz";
import crypto from "crypto";
import { body, validationResult } from "express-validator";
import { logger } from "../lib/logger/logger";

const quizRouter = express.Router();

quizRouter.use((req, res, next) => {
  if (req.session.user) {
    req.user = req.session.user;
    next();
  } else {
    next(new Error("401"));
  }
});

quizRouter.post(
  "/",
  [
    body("questions").isArray(),
    body("questions.*").isString(),
    body("title").isString(),
    body("limit").isNumeric(),
  ],
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ errors: errors.array() });
    }
    try {
      const { questions, title, limit } = req.body;

      const quizId = crypto.randomBytes(10).toString("hex");

      const duplicateQuiz = await Quiz.findOne({ quizId });

      if (duplicateQuiz) {
        throw new Error("500");
      }

      const QA = questions.map((item: string) => {
        return {
          question: item,
          answer: [],
        };
      });

      const newQuiz = new Quiz({
        quizId,
        creator: req.user.email,
        QA,
        current_question: 0,
        active_users: [],
        title,
        limit,
      });

      await newQuiz.save();

      logger.log("INFO", `quiz [${quizId}] has been created.`);

      res.status(201).send({ quizId });
    } catch (err) {
      next(err);
    }
  },
);

quizRouter.get("/:quizId", async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      throw new Error("404");
    }

    res.status(200).send(quiz);
  } catch (err) {
    next(err);
  }
});

quizRouter.put("/:quizId", async (req, res, next) => {
  try {
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
