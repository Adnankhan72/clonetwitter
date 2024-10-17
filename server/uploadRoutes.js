const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure 'uploads' directory exists, or create it
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with timestamp
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file extensions
  const fileTypes = /jpeg|jpg|png|mp4|mov|wmv|mp3|wav|webm/; // Added 'webm' for the recorded audio format
  // Check the file extension
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  // Check the MIME type (use mime types for image, video, and audio)
  const mimeType = file.mimetype.startsWith('image/') || 
                   file.mimetype.startsWith('video/') || 
                   file.mimetype.startsWith('audio/') || 
                   file.mimetype === 'audio/webm'; // Allowing 'audio/webm'

  if (extName && mimeType) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Invalid file type. Only images, videos, and audio files are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB file size limit
});

// File upload route for audio
router.post('/audio', upload.single('audio'), (req, res) => {
  if (req.file) {
    res.json({ message: 'Audio file uploaded successfully', file: req.file });
  } else {
    res.status(400).send({ message: 'No audio file uploaded.' });
  }
});

// File upload route for video
router.post('/video', upload.single('video'), (req, res) => {
  if (req.file) {
    res.json({ message: 'Video file uploaded successfully', file: req.file });
  } else {
    res.status(400).send({ message: 'No video file uploaded.' });
  }
});

// Global error handler for file upload
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    res.status(400).json({ error: err.message });
  } else if (err) {
    // Other errors
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
