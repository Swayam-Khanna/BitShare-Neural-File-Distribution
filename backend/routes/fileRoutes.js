const express = require("express");
const router = express.Router();
const upload = require("../utils/multerConfig");
const { protect } = require("../middleware/authMiddleware");
const { 
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
} = require("../controllers/fileController");

// Critical: Storage Stats must be before parameterized routes
router.get("/storage-stats", protect, getStorageStats);

// Optional auth for upload
router.post("/upload", (req, res, next) => {
    // Try to protect but don't fail if no token (guest upload)
    if (req.headers.authorization) {
        return protect(req, res, next);
    }
    next();
}, upload.single("file"), uploadFile);

router.get("/", protect, getFiles);
router.get("/trash", protect, getTrash);
router.get("/activities", getActivities);
router.get("/audit-logs", protect, getAuditLogs);
router.get("/info/:code", getFileByCode);
router.get("/download/:code", downloadFile);
router.put("/:id/restore", protect, restoreFile);
router.delete("/:id", protect, deleteFile);
router.delete("/:id/permanent", protect, permanentDeleteFile);

module.exports = router;
