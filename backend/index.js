import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Define CORS options
const corsOptions = {
  origin: "https://note-making-app-beige.vercel.app",  
  methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
  preflightContinue: false, 
};


// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests for OPTIONS method
app.options("*", cors(corsOptions));

// Import routes
import authRouter from "./routes/auth.route.js";
import noteRouter from "./routes/note.route.js";

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/note", noteRouter);

// Root route (Fix for "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Welcome to the Note-Making App API!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
