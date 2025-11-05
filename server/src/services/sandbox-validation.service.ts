import { chromium, Browser, Page } from 'playwright';
import logger from '../utils/logger';
import { OCRService } from './ocr.service';
import fs from 'fs/promises';
import path from 'path';

interface Script {
  id: string;
  code: string;
  filePath: string;
}

interface ValidationResult {
  success: boolean;
  steps: StepValidationResult[];
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  executionTime: number;
  error?: string;
}

interface StepValidationResult {
  stepIndex: number;
  passed: boolean;
  screenshotMatch: boolean;
  matchScore: number;
  expectedScreenshot?: string;
  actualScreenshot?: string;
  error?: string;
}

export class SandboxValidationService {
  private ocrService: OCRService;

  constructor() {
    this.ocrService = new OCRService();
  }

  async validateScript(script: Script, testData?: any): Promise<ValidationResult> {
    const startTime = Date.now();
    logger.info(`Starting validation for script: ${script.id}`);

    let browser: Browser | null = null;
    const result: ValidationResult = {
      success: false,
      steps: [],
      totalSteps: 0,
      passedSteps: 0,
      failedSteps: 0,
      executionTime: 0
    };

    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
      });
      const page = await context.newPage();

      const scriptModule = require(path.resolve(process.env.SCRIPT_OUTPUT_DIR || './generated-scripts', script.filePath));
      
      if (typeof scriptModule.runAutomation !== 'function') {
        throw new Error('Script does not export runAutomation function');
      }

      const stepResults = await this.executeWithValidation(page, scriptModule.runAutomation, testData);
      
      result.steps = stepResults;
      result.totalSteps = stepResults.length;
      result.passedSteps = stepResults.filter(s => s.passed).length;
      result.failedSteps = stepResults.filter(s => !s.passed).length;
      result.success = result.failedSteps === 0;

      await context.close();
    } catch (error: any) {
      logger.error('Script validation failed:', error);
      result.error = error.message;
      result.success = false;
    } finally {
      if (browser) {
        await browser.close();
      }
      result.executionTime = Date.now() - startTime;
    }

    logger.info(`Validation completed: ${result.passedSteps}/${result.totalSteps} steps passed`);
    return result;
  }

  private async executeWithValidation(
    page: Page,
    automationFunc: Function,
    testData?: any
  ): Promise<StepValidationResult[]> {
    const stepResults: StepValidationResult[] = [];
    
    try {
      await automationFunc(testData);

      const screenshotsDir = './screenshots';
      try {
        const files = await fs.readdir(screenshotsDir);
        const screenshotFiles = files.filter(f => f.startsWith('step_') && f.endsWith('.png'));
        
        for (let i = 0; i < screenshotFiles.length; i++) {
          const screenshotPath = path.join(screenshotsDir, screenshotFiles[i]);
          const ocrResult = await this.ocrService.extractText(screenshotPath);
          
          stepResults.push({
            stepIndex: i + 1,
            passed: ocrResult.confidence > 0.7,
            screenshotMatch: true,
            matchScore: ocrResult.confidence,
            actualScreenshot: screenshotPath
          });
        }
      } catch (error: any) {
        logger.warn('No screenshots found for validation');
      }
    } catch (error: any) {
      logger.error('Script execution failed during validation:', error);
      stepResults.push({
        stepIndex: stepResults.length + 1,
        passed: false,
        screenshotMatch: false,
        matchScore: 0,
        error: error.message
      });
    }

    return stepResults;
  }

  async compareScreenshots(expectedPath: string, actualPath: string): Promise<number> {
    try {
      const expectedText = await this.ocrService.extractText(expectedPath);
      const actualText = await this.ocrService.extractText(actualPath);

      const similarity = this.calculateTextSimilarity(expectedText.text, actualText.text);
      
      return similarity;
    } catch (error: any) {
      logger.error('Screenshot comparison failed:', error);
      return 0;
    }
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
}
