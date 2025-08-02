const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const postRoutes = require("./routes/postRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: "Too many requests from this IP, please try again later.",
// });
// app.use("/api", limiter);

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Job Portal API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/ai", aiRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
});

// Only start server if not in test mode or if directly executed
let server;
if (process.env.NODE_ENV !== "test" && require.main === module) {
  server = app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
    );
  });
}

module.exports = { app, server };
