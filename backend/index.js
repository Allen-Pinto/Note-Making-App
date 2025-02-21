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

// Define allowed origins
const allowedOrigins = [
  "https://note-making-app-beige.vercel.app",
  "https://note-making-a57agu4lm-allen-pintos-projects.vercel.app",
  "https://note-making-3c533wuqw-allen-pintos-projects.vercel.app",
  "https://note-making-jz3ddb07k-allen-pintos-projects.vercel.app",
  "https://note-making-9lesyl1eo-allen-pintos-projects.vercel.app", // Added this missing origin
];

// Define CORS options
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

// Example route
app.get("/", (req, res) => {
  res.send("Welcome to the Note-Making App API!");
});

// Import routes
import authRouter from "./routes/auth.route.js";
import noteRouter from "./routes/note.route.js";

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/note", noteRouter);

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
