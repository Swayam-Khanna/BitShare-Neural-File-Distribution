const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const dangerousExtensions = [".exe", ".sh", ".bat", ".cmd", ".msi", ".vbs", ".php", ".jsp", ".js"];
  if (dangerousExtensions.includes(ext)) {
    return cb(new Error("File type not allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = upload;
