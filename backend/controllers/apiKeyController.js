const User = require("../models/User");
const crypto = require("crypto");

const createApiKey = async (req, res) => {
    const { label } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const rawKey = `bt_${crypto.randomBytes(24).toString('hex')}`;
        const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

        user.apiKeys.push({
            key: hashedKey,
            label: label || 'Default Key',
            createdAt: new Date()
        });

        await user.save();

        // Return the raw key ONLY once
        res.status(201).json({ 
            apiKey: rawKey,
            label: label || 'Default Key',
            message: "API Key generated. Store it safely, it won't be shown again."
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const listApiKeys = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('apiKeys');
        res.json(user.apiKeys.map(k => ({
            id: k._id,
            label: k.label,
            createdAt: k.createdAt,
            lastUsed: k.lastUsed,
            keyPreview: 'bt_••••••••' + k.key.slice(-4)
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteApiKey = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(req.user._id);
        user.apiKeys = user.apiKeys.filter(k => k._id.toString() !== id);
        await user.save();
        res.json({ message: "API Key revoked successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createApiKey,
    listApiKeys,
    deleteApiKey
};
