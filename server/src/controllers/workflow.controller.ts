import { Request, Response, NextFunction } from 'express';
import { WorkflowService } from '../services/workflow.service';
import { AIScriptGeneratorService } from '../services/ai-script-generator.service';
import logger from '../utils/logger';

export class WorkflowController {
  private workflowService: WorkflowService;
  private scriptGenerator: AIScriptGeneratorService;

  constructor() {
    this.workflowService = new WorkflowService();
    this.scriptGenerator = new AIScriptGeneratorService();
  }

  createWorkflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workflowData = req.body;
      const workflow = await this.workflowService.createWorkflow(workflowData);
      
      logger.info(`Workflow created: ${workflow.id}`);
      res.status(201).json({
        success: true,
        data: workflow
      });
    } catch (error) {
      next(error);
    }
  };

  listWorkflows = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const workflows = await this.workflowService.listWorkflows({
        page: Number(page),
        limit: Number(limit),
        status: status as string
      });
      
      res.json({
        success: true,
        data: workflows
      });
    } catch (error) {
      next(error);
    }
  };

  getWorkflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const workflow = await this.workflowService.getWorkflowById(id);
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }
      
      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      next(error);
    }
  };

  updateWorkflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const workflow = await this.workflowService.updateWorkflow(id, updates);
      
      logger.info(`Workflow updated: ${id}`);
      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      next(error);
    }
  };

  deleteWorkflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.workflowService.deleteWorkflow(id);
      
      logger.info(`Workflow deleted: ${id}`);
      res.json({
        success: true,
        message: 'Workflow deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  generateScript = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const workflow = await this.workflowService.getWorkflowById(id);
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }

      logger.info(`Starting script generation for workflow: ${id}`);
      const script = await this.scriptGenerator.generateScript(workflow);
      
      res.json({
        success: true,
        data: script,
        message: 'Script generated successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
