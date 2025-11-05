import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger';

interface UploadedFile {
  id: string;
  type: 'video' | 'screenshot';
  originalName: string;
  fileName: string;
  filePath: string;
  size: number;
  mimeType: string;
  url: string;
  metadata?: any;
  createdAt: Date;
}

export class UploadService {
  private uploadDir: string;
  private files: Map<string, UploadedFile> = new Map();

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'videos'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'screenshots'), { recursive: true });
    } catch (error: any) {
      logger.error('Failed to create upload directories:', error);
    }
  }

  async processVideo(file: Express.Multer.File): Promise<UploadedFile> {
    const fileId = uuidv4();
    const fileName = `${fileId}_${file.originalname}`;
    const filePath = path.join('videos', fileName);
    const fullPath = path.join(this.uploadDir, filePath);

    await fs.writeFile(fullPath, file.buffer);

    const uploadedFile: UploadedFile = {
      id: fileId,
      type: 'video',
      originalName: file.originalname,
      fileName,
      filePath,
      size: file.size,
      mimeType: file.mimetype,
      url: `/uploads/${filePath}`,
      createdAt: new Date()
    };

    this.files.set(fileId, uploadedFile);
    logger.info(`Video uploaded: ${fileId}`);
    
    return uploadedFile;
  }

  async processScreenshot(
    file: Express.Multer.File,
    metadata?: { stepIndex?: number; stepDescription?: string }
  ): Promise<UploadedFile> {
    const fileId = uuidv4();
    const fileName = `${fileId}.png`;
    const filePath = path.join('screenshots', fileName);
    const fullPath = path.join(this.uploadDir, filePath);

    const processedImage = await sharp(file.buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 90 })
      .toBuffer();

    await fs.writeFile(fullPath, processedImage);

    const uploadedFile: UploadedFile = {
      id: fileId,
      type: 'screenshot',
      originalName: file.originalname,
      fileName,
      filePath,
      size: processedImage.length,
      mimeType: 'image/png',
      url: `/uploads/${filePath}`,
      metadata,
      createdAt: new Date()
    };

    this.files.set(fileId, uploadedFile);
    logger.info(`Screenshot uploaded: ${fileId}`);
    
    return uploadedFile;
  }

  async processScreenshots(files: Express.Multer.File[]): Promise<UploadedFile[]> {
    const uploadPromises = files.map((file, index) => 
      this.processScreenshot(file, { stepIndex: index + 1 })
    );
    
    return Promise.all(uploadPromises);
  }

  async getFileById(id: string): Promise<UploadedFile | null> {
    return this.files.get(id) || null;
  }

  async deleteFile(id: string): Promise<void> {
    const file = this.files.get(id);
    
    if (!file) {
      throw new Error('File not found');
    }

    try {
      const fullPath = path.join(this.uploadDir, file.filePath);
      await fs.unlink(fullPath);
    } catch (error: any) {
      logger.warn(`Failed to delete file: ${error.message}`);
    }

    this.files.delete(id);
    logger.info(`File deleted: ${id}`);
  }
}
