const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allow null for existing users until they set one
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // Optional for Google OAuth users
  },
  googleId: {
    type: String,
  },
  avatar: {
    type: String,
  },
  storageLimit: {
    type: Number,
    default: 100 * 1024 * 1024, // 100MB
  },
  usedStorage: {
    type: Number,
    default: 0,
  },
  tier: {
    type: String,
    enum: ["FREE", "PRO", "ENTERPRISE"],
    default: "FREE",
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
  },
  twoFactorTempSecret: {
    type: String,
  },
  apiKeys: [{
    key: String,
    label: String,
    createdAt: { type: Date, default: Date.now },
    lastUsed: Date,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
