const winston = require("winston");
require("winston-mongodb");
const dotenv = require("dotenv");

dotenv.config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Console output for general logging (always used)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
  ],
});

// Use file transport ONLY in local development (Vercel is read-only)
const isVercel = process.env.VERCEL === "1" || !!process.env.NOW_REGION;
if (process.env.NODE_ENV === "development" && !isVercel) {
    logger.add(new winston.transports.File({ filename: "logs/error.log", level: "error" }));
    logger.add(new winston.transports.File({ filename: "logs/combined.log" }));
}

// If MongoDB is available, log errors for persistent tracking (safe for production)
if (process.env.MONGO_URI) {
    logger.add(new winston.transports.MongoDB({
        db: process.env.MONGO_URI,
        options: { useUnifiedTopology: true },
        level: "error",
        collection: "server_logs",
        capped: true,
        cappedSize: 10000000 // 10MB
    }));
}

module.exports = logger;
