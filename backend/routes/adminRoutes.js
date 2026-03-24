const express = require("express");
const router = express.Router();
const { getAllUsers, updateUserTier, toggleAdminStatus } = require("../controllers/adminController");
const { protect, adminProtect } = require("../middleware/authMiddleware");

// Admin Governance Routes
router.get("/users", protect, adminProtect, getAllUsers);
router.put("/users/tier", protect, adminProtect, updateUserTier);
router.put("/users/admin", protect, adminProtect, toggleAdminStatus);

module.exports = router;
