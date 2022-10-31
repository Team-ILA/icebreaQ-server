import mongoose from "mongoose";

// 임시
const quizSchema = new mongoose.Schema({
  quizId: String, // 추후 socket.io의 room id로 사용
  creator: String,
  QA: Array, // [{q: "질문1", a: ["답변1", "답변2", ...]}, {q: "질문2", a: ["답변1", "답변2", ...]}, ...]
  current_question: Number,
  published_date: { type: Date, default: Date.now },
});

export default mongoose.model("quiz", quizSchema);
