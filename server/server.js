import "dotenv/config";
import express from "express";
import cors from "cors";
import connect from "./configs/mongodb.js";

const PORT = process.env.PORT || 4000;

const app = express();
await connect();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
