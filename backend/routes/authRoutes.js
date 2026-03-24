const express = require("express");
const router = express.Router();
const { 
    registerUser, 
    authUser, 
    googleAuth, 
    getProfile, 
    updateProfile, 
    verifyLogin2FA,
    setup2FA,
    verify2FA,
    disable2FA
} = require("../controllers/authController");
const { createApiKey, listApiKeys, deleteApiKey } = require("../controllers/apiKeyController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../utils/multerConfig");

router.post("/register", registerUser);
router.post("/login", authUser);
router.post("/verify-2fa", verifyLogin2FA);
router.post("/google", googleAuth);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("avatar"), updateProfile);

// 2FA Routes
router.post("/2fa/setup", protect, setup2FA);
router.post("/2fa/verify", protect, verify2FA);
router.post("/2fa/disable", protect, disable2FA);

// API Key Routes (Developer Synapse)
router.post("/keys", protect, createApiKey);
router.get("/keys", protect, listApiKeys);
router.delete("/keys/:id", protect, deleteApiKey);

module.exports = router;
