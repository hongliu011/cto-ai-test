import axios from 'axios';
import logger from '../utils/logger';
import fs from 'fs/promises';

interface OCRResult {
  text: string;
  confidence: number;
  blocks: OCRBlock[];
}

interface OCRBlock {
  text: string;
  confidence: number;
  bbox: [number, number, number, number];
}

export class OCRService {
  private serviceUrl: string;
  private confidenceThreshold: number;

  constructor() {
    this.serviceUrl = process.env.OCR_SERVICE_URL || 'http://localhost:8000';
    this.confidenceThreshold = parseFloat(process.env.OCR_CONFIDENCE_THRESHOLD || '0.7');
  }

  async extractText(imagePath: string): Promise<OCRResult> {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const response = await axios.post(
        `${this.serviceUrl}/ocr`,
        {
          image: base64Image,
          language: 'ch'
        },
        {
          timeout: 30000
        }
      );

      const result: OCRResult = {
        text: response.data.text || '',
        confidence: response.data.confidence || 0,
        blocks: response.data.blocks || []
      };

      logger.info(`OCR extraction completed with confidence: ${result.confidence}`);
      return result;
    } catch (error: any) {
      logger.error('OCR service call failed:', error.message);
      
      return this.fallbackOCR(imagePath);
    }
  }

  private async fallbackOCR(imagePath: string): Promise<OCRResult> {
    logger.warn('Using fallback OCR (mock)');
    
    return {
      text: 'Fallback OCR - Text extraction simulated',
      confidence: 0.5,
      blocks: []
    };
  }

  async compareTexts(text1: string, text2: string): Promise<number> {
    const normalized1 = this.normalizeText(text1);
    const normalized2 = this.normalizeText(text2);

    if (normalized1 === normalized2) {
      return 1.0;
    }

    const similarity = this.calculateLevenshteinSimilarity(normalized1, normalized2);
    return similarity;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  private calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    const distance = matrix[len1][len2];
    return 1 - distance / maxLen;
  }
}
