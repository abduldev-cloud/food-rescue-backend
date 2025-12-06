import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import ngoRoutes from "./routes/ngoRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/app/ngo", ngoRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Food Rescue API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
