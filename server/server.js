import "dotenv/config";
import express from "express";
import cors from "cors";
import connect from "./configs/mongodb.js";
import userRouter from "./routes/user.route.js";

const PORT = process.env.PORT || 4000;

const app = express();
await connect();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
