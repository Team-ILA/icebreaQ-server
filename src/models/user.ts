import mongoose from "mongoose";

// 임시
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, required: true }, 
  password: { type: String, required: true }, // Authentication 취약점으로 활용될 hash 값 보관
});

export default mongoose.model("user", userSchema);
