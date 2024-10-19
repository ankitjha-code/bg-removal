import "dotenv/config";
import express from "express";
import cors from "cors";
import connect from "./configs/mongodb.js";
import userRouter from "./routes/user.route.js";
import imageRouter from "./routes/image.route.js";

const PORT = process.env.PORT || 4000;

const app = express();
const corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization", "token"], // Add 'token' to allowed headers
};

app.use(cors(corsOptions));
await connect();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/user", userRouter);
app.use("/api/image", imageRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
