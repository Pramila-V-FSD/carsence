import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import carRoutes from "./routes/carRoutes.js";
import shortlistRoutes from "./routes/shortlistRoutes.js";
import advisorRoutes from "./routes/advisorRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ DATABASE ERROR: MONGO_URI environment variable is missing! You must add it in the Render Environment tab.");
} else {
  mongoose
    .connect(mongoURI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
}

// API Routes
app.use("/api/cars", carRoutes);
app.use("/api/shortlist", shortlistRoutes);
app.use("/api/advisor", advisorRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
