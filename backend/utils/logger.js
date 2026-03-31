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
    // Console output for general logging
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File transport for error logs
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// If MongoDB is available, log errors to DB as well for persistent tracking
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
