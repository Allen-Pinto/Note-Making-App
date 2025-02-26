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

// Define allowed origins for CORS
const allowedOrigins = [
  "https://note-making-app-eta.vercel.app", 
  "https://note-making-app-git-main-allen-pintos-projects.vercel.app",
  "https://note-making-app-allen-pintos-projects.vercel.app",
];

// CORS Options configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true, // Allow credentials (cookies)
  preflightContinue: false,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle OPTIONS requests properly
app.options("*", cors(corsOptions));

// Manually set CORS headers for all responses
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Basic test route
app.get("/", (req, res) => {
  res.send("Welcome to the Note-Making App API!");
});

// Import Routes
import authRouter from "./routes/auth.route.js";
import noteRouter from "./routes/note.route.js";

// Define API Routes
app.use("/api/auth", authRouter);
app.use("/api/note", noteRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
