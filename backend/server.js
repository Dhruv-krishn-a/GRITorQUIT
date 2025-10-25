// backend/server.js
import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";

// Database
import connectDB from "./config/database.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import plansRoutes from "./routes/plans.js";
import uploadRoutes from "./routes/upload.js";

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/upload", uploadRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({ 
    message: "GRITorQUIT Backend is running...",
    version: "1.0.0"
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    database: "Connected" // You might want to check DB connection here
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server Error:", error);
  res.status(500).json({ 
    message: "Something went wrong!",
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});