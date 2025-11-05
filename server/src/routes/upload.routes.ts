import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { uploadMiddleware } from '../middlewares/upload';

const router = Router();
const uploadController = new UploadController();

router.post('/video', uploadMiddleware.single('video'), uploadController.uploadVideo);
router.post('/screenshot', uploadMiddleware.single('screenshot'), uploadController.uploadScreenshot);
router.post('/screenshots/batch', uploadMiddleware.array('screenshots', 20), uploadController.uploadScreenshots);
router.delete('/:id', uploadController.deleteFile);

export default router;
