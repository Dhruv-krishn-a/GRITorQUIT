// backend/middleware/upload.js
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `plan-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("📁 File upload attempt:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  // Get file extension
  const ext = path.extname(file.originalname).toLowerCase();
  console.log("🔍 File extension:", ext);
  
  // Allow by extension only (more reliable than MIME types)
  if (ext === '.xlsx' || ext === '.xls' || ext === '.xlsm') {
    console.log('✅ File accepted based on extension');
    cb(null, true);
  } else {
    console.log('❌ File rejected - invalid extension:', ext);
    cb(new Error(`Only Excel files (.xlsx, .xls) are allowed. Received: ${file.originalname}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Add error handling middleware
const handleUploadErrors = (err, req, res, next) => {
  console.log("🛑 Upload error:", err.message);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Only one file allowed.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected field name. Use "excelFile".' });
    }
  }
  
  if (err.message && err.message.includes('Only Excel files are allowed')) {
    return res.status(400).json({ message: err.message });
  }
  
  next(err);
};

// Export both upload and error handler
export { handleUploadErrors };
export default upload;