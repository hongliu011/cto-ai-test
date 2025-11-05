import { Request, Response, NextFunction } from 'express';
import { ScriptService } from '../services/script.service';
import { SandboxValidationService } from '../services/sandbox-validation.service';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs/promises';

export class ScriptController {
  private scriptService: ScriptService;
  private validationService: SandboxValidationService;

  constructor() {
    this.scriptService = new ScriptService();
    this.validationService = new SandboxValidationService();
  }

  listScripts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const scripts = await this.scriptService.listScripts({
        page: Number(page),
        limit: Number(limit),
        status: status as string
      });
      
      res.json({
        success: true,
        data: scripts
      });
    } catch (error) {
      next(error);
    }
  };

  getScript = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const script = await this.scriptService.getScriptById(id);
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Script not found'
        });
      }
      
      res.json({
        success: true,
        data: script
      });
    } catch (error) {
      next(error);
    }
  };

  downloadScript = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const script = await this.scriptService.getScriptById(id);
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Script not found'
        });
      }

      const scriptPath = path.join(process.env.SCRIPT_OUTPUT_DIR || './generated-scripts', script.filePath);
      const fileContent = await fs.readFile(scriptPath, 'utf-8');
      
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Content-Disposition', `attachment; filename="${script.name}.js"`);
      res.send(fileContent);
    } catch (error) {
      next(error);
    }
  };

  validateScript = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { testData } = req.body;
      
      const script = await this.scriptService.getScriptById(id);
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Script not found'
        });
      }

      logger.info(`Starting validation for script: ${id}`);
      const validationResult = await this.validationService.validateScript(script, testData);
      
      await this.scriptService.updateScriptValidation(id, validationResult);
      
      res.json({
        success: true,
        data: validationResult
      });
    } catch (error) {
      next(error);
    }
  };

  deleteScript = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.scriptService.deleteScript(id);
      
      logger.info(`Script deleted: ${id}`);
      res.json({
        success: true,
        message: 'Script deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
