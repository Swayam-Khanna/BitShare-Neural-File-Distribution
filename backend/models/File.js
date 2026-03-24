const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Optional for guest uploads
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  fileType: {
    type: String,
  },
  downloadCode: {
    type: String,
    required: true,
    unique: true,
  },
  qrCode: {
    type: String,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String, // Hashed password for the file
  },
  expiresAt: {
    type: Date,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  uploadTime: {
    type: Date,
    default: Date.now,
  },
  downloads: [{
    ip: String,
    geo: {
      country: String,
      city: String,
      lat: Number,
      lng: Number,
    },
    timestamp: { type: Date, default: Date.now },
  }],
  auditLogs: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date, default: Date.now },
    details: Object,
  }],
  summary: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("File", fileSchema);
