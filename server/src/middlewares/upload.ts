import multer from 'multer';
import { AppError } from './errorHandler';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedVideoFormats = (process.env.ALLOWED_VIDEO_FORMATS || 'mp4,avi,mov,mkv').split(',');
  const allowedImageFormats = (process.env.ALLOWED_IMAGE_FORMATS || 'jpg,jpeg,png,bmp').split(',');
  
  const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
  
  if (file.mimetype.startsWith('video/') && allowedVideoFormats.includes(ext)) {
    cb(null, true);
  } else if (file.mimetype.startsWith('image/') && allowedImageFormats.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only videos and images are allowed.', 400));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600')
  }
});
