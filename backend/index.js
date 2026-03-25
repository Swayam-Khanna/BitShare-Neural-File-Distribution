const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const connectDB = require("./db");
const path = require("path");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: true, // Allow all origins for mobile/local network access
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

// Socket.io injection
app.use((req, res, next) => {
  req.io = io;
  next();
});

const fileRoutes = require("./routes/fileRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/files", fileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);


io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("BitShare API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
