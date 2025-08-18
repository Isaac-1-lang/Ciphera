import multer from 'multer';
import path from 'path';
import { logger } from '../utils/logger.js';

// Configure multer for file uploads
const storage = multer.memoryStorage();

// File filter to only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, JPG, and PNG files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only allow 1 file at a time
  }
});

// Middleware for single file upload
export const uploadSingleFile = upload.single('file');

// Error handling middleware for multer
export const handleFileUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file is allowed.'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + error.message
    });
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  logger.error('File upload error:', error);
  return res.status(500).json({
    success: false,
    message: 'Internal server error during file upload'
  });
};

// Helper function to extract text content from file
export const extractFileContent = async (file) => {
  try {
    if (file.mimetype === 'text/plain') {
      // For text files, return the buffer as string
      return file.buffer.toString('utf8');
    } else if (file.mimetype === 'application/pdf') {
      // Extract text from PDF using pdf-parse (dynamic import to avoid startup crashes)
      try {
        // Import direct implementation to avoid package test file resolution issues
        const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
        const data = await pdfParse(file.buffer);
        return data.text || '';
      } catch (e) {
        logger.error('PDF parsing failed, falling back:', e);
        return '';
      }
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Extract text from DOCX using mammoth (dynamic import)
      try {
        const mammothMod = await import('mammoth');
        const extractRawText = mammothMod.extractRawText || mammothMod.default?.extractRawText;
        if (!extractRawText) throw new Error('mammoth.extractRawText not found');
        const result = await extractRawText({ buffer: file.buffer });
        return result.value || '';
      } catch (e) {
        logger.error('DOCX parsing failed, falling back:', e);
        return '';
      }
    } else if (file.mimetype === 'application/msword') {
      // .doc (binary) not supported by mammoth; return placeholder
      return `Word .doc file: ${file.originalname} (Content extraction not implemented)`;
    } else if (file.mimetype.startsWith('image/')) {
      // For images, return a placeholder
      return `Image file: ${file.originalname} (Content extraction not implemented in this demo)`;
    } else {
      return `File: ${file.originalname} (Content extraction not implemented for this file type)`;
    }
  } catch (error) {
    logger.error('Error extracting file content:', error);
    throw new Error('Failed to extract file content');
  }
};
