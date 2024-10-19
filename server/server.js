import "dotenv/config";
import express from "express";
import cors from "cors";
import connect from "./configs/mongodb.js";
import userRouter from "./routes/user.route.js";
import imageRouter from "./routes/image.route.js";

const PORT = process.env.PORT || 4000;

const app = express();
await connect();

app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your frontend
    methods: "GET,POST",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/user", userRouter);
app.use("/api/image", imageRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
