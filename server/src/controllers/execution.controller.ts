import { Request, Response, NextFunction } from 'express';
import { ExecutionService } from '../services/execution.service';
import logger from '../utils/logger';

export class ExecutionController {
  private executionService: ExecutionService;

  constructor() {
    this.executionService = new ExecutionService();
  }

  executeScript = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { scriptId, parameters } = req.body;
      
      logger.info(`Executing script: ${scriptId}`);
      const execution = await this.executionService.executeScript(scriptId, parameters);
      
      res.status(202).json({
        success: true,
        data: execution,
        message: 'Script execution started'
      });
    } catch (error) {
      next(error);
    }
  };

  listExecutions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10, scriptId, status } = req.query;
      const executions = await this.executionService.listExecutions({
        page: Number(page),
        limit: Number(limit),
        scriptId: scriptId as string,
        status: status as string
      });
      
      res.json({
        success: true,
        data: executions
      });
    } catch (error) {
      next(error);
    }
  };

  getExecution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const execution = await this.executionService.getExecutionById(id);
      
      if (!execution) {
        return res.status(404).json({
          success: false,
          error: 'Execution not found'
        });
      }
      
      res.json({
        success: true,
        data: execution
      });
    } catch (error) {
      next(error);
    }
  };

  getExecutionLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const logs = await this.executionService.getExecutionLogs(id);
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  };

  stopExecution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.executionService.stopExecution(id);
      
      logger.info(`Execution stopped: ${id}`);
      res.json({
        success: true,
        message: 'Execution stopped successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
