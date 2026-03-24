const File = require("../models/File");
const Activity = require("../models/Activity");
const User = require("../models/User");
const QRCode = require("qrcode");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const os = require("os");

const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const generateDownloadCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { isPrivate, password, expiresAt } = req.body;

    // Check storage limits if user is logged in
    if (req.user) {
        const User = require("../models/User");
        const user = await User.findById(req.user._id);
        if (user.usedStorage + req.file.size > user.storageLimit) {
            return res.status(403).json({ 
                message: "Storage limit exceeded. Please upgrade to Pro for more space.",
                limit: user.storageLimit,
                used: user.usedStorage
            });
        }
        
        // Update user's used storage
        user.usedStorage += req.file.size;
        await user.save();
    }

    const downloadCode = generateDownloadCode();
    
    // Create the full URL for the QR code
    const localIp = getLocalIp();
    const frontendUrl = process.env.FRONTEND_URL || `http://${localIp}:5173`;
    const downloadUrl = `${frontendUrl}/d/${downloadCode}`;
    const qrCode = await QRCode.toDataURL(downloadUrl);

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // --- Neural Content Intelligence (Phase 5) ---
    let summary = "Neural analysis pending...";
    if (req.file.mimetype === 'text/plain') {
        const content = fs.readFileSync(req.file.path, 'utf8');
        summary = content.slice(0, 150) + (content.length > 150 ? "..." : "");
    } else if (req.file.mimetype === 'application/pdf') {
        summary = "PDF Document Structure Detected. Detailed summary available in Pro Terminal.";
    }

    const file = await File.create({
      user: req.user ? req.user._id : null,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      fileType: req.file.mimetype,
      downloadCode,
      qrCode,
      isPrivate: isPrivate === 'true',
      password: hashedPassword,
      expiresAt: (expiresAt && req.user && req.user.tier !== 'FREE') ? new Date(expiresAt) : null,
      summary,
      thumbnail: req.file.mimetype.startsWith('image/') ? `/public/uploads/${req.file.filename}` : null
    });

    const activity = await Activity.create({
        user: req.user ? req.user._id : null,
        type: "UPLOAD",
        message: `File uploaded: ${file.originalName}`,
        file: file._id
    });

    if (req.io) {
      req.io.emit("fileUploaded", file);
      req.io.emit("activityFeedUpdate", activity);
    }

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFiles = async (req, res) => {
  try {
    const query = req.user 
      ? { user: req.user._id, isDeleted: false } 
      : { user: null, isDeleted: false };
    const files = await File.find(query).sort({ uploadTime: -1 });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrash = async (req, res) => {
  try {
    const query = req.user 
      ? { user: req.user._id, isDeleted: true } 
      : { user: null, isDeleted: true };
    const files = await File.find(query).sort({ deletedAt: -1 });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { code } = req.params;
    const { password } = req.query;
    
    const file = await File.findOne({ downloadCode: code });

    if (!file) {
      return res.status(404).json({ message: "File not found or invalid code" });
    }

    if (file.expiresAt && new Date() > file.expiresAt) {
        return res.status(410).json({ message: "Link has expired" });
    }

    if (file.password) {
        if (!password) {
            return res.status(401).json({ message: "Password required" });
        }
        const isMatch = await bcrypt.compare(password, file.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }
    }

    // Capture Download Analytics
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Simulated Geolocation for Heatmap Demo
    const countries = ['USA', 'UK', 'Germany', 'India', 'Japan', 'Canada'];
    const cities = ['New York', 'London', 'Berlin', 'Mumbai', 'Tokyo', 'Toronto'];
    const randomIndex = Math.floor(Math.random() * countries.length);
    
    const geo = {
        country: countries[randomIndex],
        city: cities[randomIndex],
        lat: 20 + (Math.random() * 30),
        lng: 70 + (Math.random() * 40)
    };

    file.downloadCount += 1;
    file.lastAccessed = new Date();
    file.downloads.push({
        ip,
        geo,
        timestamp: new Date()
    });
    
    await file.save();

    const activity = await Activity.create({
        user: file.user,
        type: "DOWNLOAD",
        message: `File downloaded: ${file.originalName}`,
        file: file._id
    });

    if (req.io && file.user) {
        req.io.to(file.user.toString()).emit("notification", {
            message: `Someone downloaded your file: ${file.originalName}`,
            geo: geo.city
        });
        req.io.emit("activityFeedUpdate", activity);
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFileByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const file = await File.findOne({ downloadCode: code }).select("-path -password");
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        res.json(file);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findById(id);
        
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.user && file.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Soft delete
        file.isDeleted = true;
        file.deletedAt = new Date();
        await file.save();
        
        res.json({ message: "File moved to trash" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const restoreFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findById(id);
        
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.user && file.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        file.isDeleted = false;
        file.deletedAt = null;
        await file.save();
        
        res.json({ message: "File restored successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const permanentDeleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findById(id);
        
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.user && file.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Delete from local storage
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        await File.findByIdAndDelete(id);
        
        res.json({ message: "File permanently deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getActivities = async (req, res) => {
    try {
        const activities = await Activity.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('file', 'originalName');
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAuditLogs = async (req, res) => {
    try {
        const files = await File.find({ user: req.user._id });
        let allLogs = [];
        files.forEach(f => {
            if (f.auditLogs) {
                f.auditLogs.forEach(log => {
                    allLogs.push({
                        ...log.toObject(),
                        fileId: f._id,
                        fileName: f.originalName
                    });
                });
            }
        });
        
        // Sort by timestamp descending
        allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        res.json(allLogs.slice(0, 50)); // Return last 50 logs
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStorageStats = async (req, res) => {
    try {
        const files = await File.find({ user: req.user._id, isDeleted: false });
        
        // Activity Pulse (uploads per day for last 7 days)
        const pulse = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const count = files.filter(f => new Date(f.uploadTime).toDateString() === date.toDateString()).length;
            return { day: date.toLocaleDateString('en-US', { weekday: 'short' }), intensity: count + 1 };
        }).reverse();

        // Storage Forecast
        const totalSize = files.reduce((acc, f) => acc + f.size, 0);
        const user = await User.findById(req.user._id);
        const limit = user.storageLimit;
        
        // Mocking a depletion signal based on avg daily growth
        const avgDailyGrowth = totalSize / (files.length || 1); 
        const daysLeft = avgDailyGrowth > 0 ? Math.floor((limit - totalSize) / (avgDailyGrowth * 1.5)) : 365;

        const localIp = getLocalIp();
        res.json({ pulse, totalSize, limit, daysLeft, localIp });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
  uploadFile,
  getFiles,
  getTrash,
  downloadFile,
  getFileByCode,
  deleteFile,
  restoreFile,
  permanentDeleteFile,
  getActivities,
  getAuditLogs,
  getStorageStats
};
