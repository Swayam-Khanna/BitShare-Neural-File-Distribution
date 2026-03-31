const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const { rateLimit } = require("express-rate-limit");
const connectDB = require("./config/db");
const path = require("path");
const pusher = require("./config/pusher");
const logger = require("./utils/logger");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// Load Environment Variables
dotenv.config();

// Startup Environment Validation
const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "PUSHER_APP_ID",
  "PUSHER_KEY",
  "PUSHER_SECRET"
];

const missingEnv = requiredEnv.filter(env => !process.env[env]);
if (missingEnv.length > 0) {
  logger.error(`CRITICAL: Missing environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

// Connect Database
connectDB();

const app = express();

// --- Production Middleware ---
app.use(helmet({ 
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false
}));

app.use(compression());
app.use(morgan("combined", { stream: { write: message => logger.info(message.trim()) } }));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

app.use("/api/", globalLimiter);

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true;
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl.startsWith("/api/payments/webhook")) {
      req.rawBody = buf;
    }
  }
}));

app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));

// Pusher Injection
app.use((req, res, next) => {
  req.pusher = pusher;
  next();
});

// --- Routes ---
const fileRoutes = require("./routes/fileRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/files", fileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// --- Production Serving ---
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));
  
  app.get("*", (req, res) => {
    if (!req.originalUrl.startsWith("/api")) {
      res.sendFile(path.join(frontendPath, "index.html"));
    }
  });
} else {
  app.get("/", (req, res) => {
    res.send("BitShare API is running... (PRO level)");
  });
}

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- Server Lifecycle ---
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Process Level Error Listeners
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
