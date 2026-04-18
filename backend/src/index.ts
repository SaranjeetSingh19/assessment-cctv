import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import apiRoutes from "./routes/apiRoutes"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Factory is running..." });
});

app.use("/api", apiRoutes); 

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});