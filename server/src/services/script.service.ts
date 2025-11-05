import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

interface Script {
  id: string;
  workflowId: string;
  name: string;
  code: string;
  language: 'javascript' | 'python';
  framework: 'playwright' | 'puppeteer' | 'selenium';
  filePath: string;
  status: 'pending' | 'validated' | 'failed';
  validationResult?: any;
  createdAt: Date;
  updatedAt: Date;
}

export class ScriptService {
  private scripts: Map<string, Script> = new Map();

  async createScript(data: Omit<Script, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Script> {
    const script: Script = {
      ...data,
      id: uuidv4(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.scripts.set(script.id, script);
    logger.info(`Script created: ${script.id}`);
    
    return script;
  }

  async listScripts(options: {
    page: number;
    limit: number;
    status?: string;
  }): Promise<{ scripts: Script[]; total: number; page: number; limit: number }> {
    let scripts = Array.from(this.scripts.values());

    if (options.status) {
      scripts = scripts.filter(s => s.status === options.status);
    }

    scripts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = scripts.length;
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedScripts = scripts.slice(startIndex, endIndex);

    return {
      scripts: paginatedScripts,
      total,
      page: options.page,
      limit: options.limit
    };
  }

  async getScriptById(id: string): Promise<Script | null> {
    return this.scripts.get(id) || null;
  }

  async updateScript(id: string, updates: Partial<Script>): Promise<Script> {
    const script = this.scripts.get(id);
    
    if (!script) {
      throw new Error('Script not found');
    }

    const updatedScript: Script = {
      ...script,
      ...updates,
      id: script.id,
      createdAt: script.createdAt,
      updatedAt: new Date()
    };

    this.scripts.set(id, updatedScript);
    logger.info(`Script updated: ${id}`);
    
    return updatedScript;
  }

  async updateScriptValidation(id: string, validationResult: any): Promise<Script> {
    const script = this.scripts.get(id);
    
    if (!script) {
      throw new Error('Script not found');
    }

    const status = validationResult.success ? 'validated' : 'failed';
    
    return this.updateScript(id, {
      status,
      validationResult
    });
  }

  async deleteScript(id: string): Promise<void> {
    const script = this.scripts.get(id);
    
    if (!script) {
      throw new Error('Script not found');
    }

    try {
      const scriptPath = path.join(process.env.SCRIPT_OUTPUT_DIR || './generated-scripts', script.filePath);
      await fs.unlink(scriptPath);
    } catch (error: any) {
      logger.warn(`Failed to delete script file: ${error.message}`);
    }

    this.scripts.delete(id);
    logger.info(`Script deleted: ${id}`);
  }
}
