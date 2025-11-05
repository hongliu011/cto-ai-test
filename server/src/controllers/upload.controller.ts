import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import logger from '../utils/logger';

export class UploadController {
  private uploadService: UploadService;

  constructor() {
    this.uploadService = new UploadService();
  }

  uploadVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No video file provided'
        });
      }

      const videoData = await this.uploadService.processVideo(req.file);
      
      logger.info(`Video uploaded: ${videoData.id}`);
      res.status(201).json({
        success: true,
        data: videoData
      });
    } catch (error) {
      next(error);
    }
  };

  uploadScreenshot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No screenshot file provided'
        });
      }

      const { stepIndex, stepDescription } = req.body;
      const screenshotData = await this.uploadService.processScreenshot(req.file, {
        stepIndex: Number(stepIndex),
        stepDescription
      });
      
      logger.info(`Screenshot uploaded: ${screenshotData.id}`);
      res.status(201).json({
        success: true,
        data: screenshotData
      });
    } catch (error) {
      next(error);
    }
  };

  uploadScreenshots = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No screenshot files provided'
        });
      }

      const screenshots = await this.uploadService.processScreenshots(req.files);
      
      logger.info(`Batch upload: ${screenshots.length} screenshots`);
      res.status(201).json({
        success: true,
        data: screenshots
      });
    } catch (error) {
      next(error);
    }
  };

  deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.uploadService.deleteFile(id);
      
      logger.info(`File deleted: ${id}`);
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
