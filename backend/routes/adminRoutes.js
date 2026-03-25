const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { getAllUsers, updateUserTier, toggleAdminStatus } = require("../controllers/adminController");
const { protect, adminProtect } = require("../middleware/authMiddleware");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  }
  next();
};

// Admin Governance Routes
router.get("/users", protect, adminProtect, getAllUsers);

router.put("/users/tier", protect, adminProtect, [
  body("userId").isMongoId().withMessage("Valid userId is required"),
  body("tier").optional().isIn(["FREE", "PRO", "ENTERPRISE"]).withMessage("Invalid tier level"),
  body("storageLimit").optional().isNumeric().withMessage("Storage limit must be a number"),
  validateRequest
], updateUserTier);

router.put("/users/admin", protect, adminProtect, [
  body("userId").isMongoId().withMessage("Valid userId is required"),
  validateRequest
], toggleAdminStatus);

module.exports = router;
