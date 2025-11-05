import { v4 as uuidv4 } from 'uuid';
import { chromium } from 'playwright';
import logger from '../utils/logger';
import { ScriptService } from './script.service';
import path from 'path';

interface Execution {
  id: string;
  scriptId: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  parameters?: any;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  logs: ExecutionLog[];
  error?: string;
}

interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export class ExecutionService {
  private executions: Map<string, Execution> = new Map();
  private runningExecutions: Map<string, any> = new Map();
  private scriptService: ScriptService;

  constructor() {
    this.scriptService = new ScriptService();
  }

  async executeScript(scriptId: string, parameters?: any): Promise<Execution> {
    const script = await this.scriptService.getScriptById(scriptId);
    
    if (!script) {
      throw new Error('Script not found');
    }

    const execution: Execution = {
      id: uuidv4(),
      scriptId,
      status: 'running',
      parameters,
      startTime: new Date(),
      logs: []
    };

    this.executions.set(execution.id, execution);
    logger.info(`Execution started: ${execution.id}`);

    this.runScriptAsync(execution, script).catch((error) => {
      logger.error(`Execution failed: ${execution.id}`, error);
    });

    return execution;
  }

  private async runScriptAsync(execution: Execution, script: any): Promise<void> {
    const browser = await chromium.launch({ headless: true });
    this.runningExecutions.set(execution.id, browser);

    try {
      this.addLog(execution, 'info', 'Browser launched');

      const scriptPath = path.resolve(process.env.SCRIPT_OUTPUT_DIR || './generated-scripts', script.filePath);
      const scriptModule = require(scriptPath);

      if (typeof scriptModule.runAutomation !== 'function') {
        throw new Error('Script does not export runAutomation function');
      }

      this.addLog(execution, 'info', 'Executing automation script');
      await scriptModule.runAutomation(execution.parameters);

      execution.status = 'completed';
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      
      this.addLog(execution, 'info', `Execution completed in ${execution.duration}ms`);
      logger.info(`Execution completed: ${execution.id}`);
    } catch (error: any) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      
      this.addLog(execution, 'error', `Execution failed: ${error.message}`);
      logger.error(`Execution failed: ${execution.id}`, error);
    } finally {
      await browser.close();
      this.runningExecutions.delete(execution.id);
    }
  }

  private addLog(execution: Execution, level: ExecutionLog['level'], message: string): void {
    execution.logs.push({
      timestamp: new Date(),
      level,
      message
    });
  }

  async listExecutions(options: {
    page: number;
    limit: number;
    scriptId?: string;
    status?: string;
  }): Promise<{ executions: Execution[]; total: number; page: number; limit: number }> {
    let executions = Array.from(this.executions.values());

    if (options.scriptId) {
      executions = executions.filter(e => e.scriptId === options.scriptId);
    }

    if (options.status) {
      executions = executions.filter(e => e.status === options.status);
    }

    executions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    const total = executions.length;
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedExecutions = executions.slice(startIndex, endIndex);

    return {
      executions: paginatedExecutions,
      total,
      page: options.page,
      limit: options.limit
    };
  }

  async getExecutionById(id: string): Promise<Execution | null> {
    return this.executions.get(id) || null;
  }

  async getExecutionLogs(id: string): Promise<ExecutionLog[]> {
    const execution = this.executions.get(id);
    return execution ? execution.logs : [];
  }

  async stopExecution(id: string): Promise<void> {
    const execution = this.executions.get(id);
    
    if (!execution) {
      throw new Error('Execution not found');
    }

    if (execution.status !== 'running') {
      throw new Error('Execution is not running');
    }

    const browser = this.runningExecutions.get(id);
    if (browser) {
      await browser.close();
      this.runningExecutions.delete(id);
    }

    execution.status = 'stopped';
    execution.endTime = new Date();
    execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
    
    this.addLog(execution, 'warn', 'Execution stopped by user');
    logger.info(`Execution stopped: ${id}`);
  }
}
