const User = require("../models/User");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password").sort("-createdAt");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserTier = async (req, res) => {
    const { userId, tier, storageLimit } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Node not found" });

        if (tier) user.tier = tier;
        if (storageLimit) user.storageLimit = storageLimit;

        await user.save();
        res.json({ message: `Node ${user.name} recalibrated to ${tier || user.tier}`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleAdminStatus = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Node not found" });

        user.isAdmin = !user.isAdmin;
        await user.save();
        res.json({ message: `Admin clearance ${user.isAdmin ? 'granted' : 'revoked'} for ${user.name}`, isAdmin: user.isAdmin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    updateUserTier,
    toggleAdminStatus
};
