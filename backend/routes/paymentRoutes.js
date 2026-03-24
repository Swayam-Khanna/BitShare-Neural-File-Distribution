const express = require("express");
const router = express.Router();
const { createCheckoutSession, handleStripeWebhook } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// We need the raw body for the webhook, so we'll handle it specially in index.js
// but here we define the routes
router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

module.exports = router;
