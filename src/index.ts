import express from "express";

const app = express();
const port = 3000;

app.use(express.json());

// 추후 router로 분리
app.get("/", (req, res) => {
  res.send({ status: "Hello, World!" });
});

app.post("/", (req, res) => {
  res.send(req.body);
});

app.listen(port, () => {
  console.log(`listening to port ${port}!`);
});
