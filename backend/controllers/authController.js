const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        usedStorage: user.usedStorage,
        storageLimit: user.storageLimit,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // Check if 2FA is enabled
      if (user.isTwoFactorEnabled) {
        return res.json({
          requires2FA: true,
          userId: user._id,
          message: "2FA Verification Required"
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        usedStorage: user.usedStorage,
        storageLimit: user.storageLimit,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleAuth = async (req, res) => {
    // In a real app, you'd verify the Google token from the client
    const { name, email, googleId, avatar } = req.body;
    
    try {
        let user = await User.findOne({ email });
        
        if (user) {
            user.googleId = googleId;
            user.avatar = avatar;
            await user.save();
        } else {
            user = await User.create({
                name,
                email,
                googleId,
                avatar
            });
        }
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            tier: user.tier,
            usedStorage: user.usedStorage,
            storageLimit: user.storageLimit,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        console.log("Update Profile Request Body:", req.body);
        console.log("Update Profile Request File:", req.file);
        
        const user = await User.findById(req.user._id);

        if (user) {
            // Check if username is taken by someone else
            if (req.body.username && req.body.username !== user.username) {
                const usernameExists = await User.findOne({ username: req.body.username });
                if (usernameExists) {
                    return res.status(400).json({ message: "Username is already taken" });
                }
            }

            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            
            // Handle username: if empty string, set to undefined to avoid duplicate key error
            if (req.body.username === "") {
                user.username = undefined;
            } else if (req.body.username) {
                user.username = req.body.username;
            }
            
            // Handle avatar: if file uploaded, use it. Otherwise, use string if provided.
            if (req.file) {
                // IMPORTANT: Match the static folder prefix from index.js
                const avatarUrl = `/public/uploads/${req.file.filename}`;
                user.avatar = avatarUrl;
            } else if (req.body.avatar !== undefined && req.body.avatar !== "") {
                user.avatar = req.body.avatar;
            }
            
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                tier: updatedUser.tier,
                usedStorage: updatedUser.usedStorage,
                storageLimit: updatedUser.storageLimit,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: error.message });
    }
};

const verifyLogin2FA = async (req, res) => {
    const { userId, token } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token
        });

        if (verified) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                tier: user.tier,
                usedStorage: user.usedStorage,
                storageLimit: user.storageLimit,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid 2FA code" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const setup2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const secret = speakeasy.generateSecret({ name: `BitShare (${user.email})` });
        user.twoFactorTempSecret = secret.base32;
        await user.save();

        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
        res.json({ qrCodeUrl, secret: secret.base32 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verify2FA = async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorTempSecret,
            encoding: 'base32',
            token
        });

        if (verified) {
            user.twoFactorSecret = user.twoFactorTempSecret;
            user.twoFactorTempSecret = undefined;
            user.isTwoFactorEnabled = true;
            await user.save();
            res.json({ message: "2FA Enabled Successfully", user: { isTwoFactorEnabled: true } });
        } else {
            res.status(400).json({ message: "Invalid verification code" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const disable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isTwoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        await user.save();
        res.json({ message: "2FA Disabled Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  registerUser,
  authUser,
  googleAuth,
  getProfile,
  updateProfile,
  verifyLogin2FA,
  setup2FA,
  verify2FA,
  disable2FA
};
