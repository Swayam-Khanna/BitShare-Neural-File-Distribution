const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });
};

const apiKeyAuth = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ message: "API Key required" });

    try {
        const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
        const user = await User.findOne({ "apiKeys.key": hashedKey });

        if (!user) return res.status(401).json({ message: "Invalid API Key" });

        // Update last used
        await User.updateOne(
            { _id: user._id, "apiKeys.key": hashedKey },
            { $set: { "apiKeys.$.lastUsed": new Date() } }
        );

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const adminProtect = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: "Access Denied: Administrative Clearance Required" });
    }
};

module.exports = { protect, apiKeyAuth, adminProtect };
