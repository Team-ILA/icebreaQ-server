import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  // 추후 socket.io의 room id로 사용
  quizId: { type: String, required: true },
  creator: { type: String, required: true },
  // [{q: "질문1", a: ["답변1", "답변2", ...]}, {q: "질문2", a: ["답변1", "답변2", ...]}, ...]
  QA: Array,
  current_question: { type: Number, required: true },
  published_date: { type: Date, default: Date.now },
  active_users: { type: Array, default: [] },
  title: { type: String, required: true },
  limit: { type: Number, required: true },
});

export default mongoose.model("quiz", quizSchema);
