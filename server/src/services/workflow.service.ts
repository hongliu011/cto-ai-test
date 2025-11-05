import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

interface WorkflowStep {
  id: string;
  order: number;
  action: string;
  target: string;
  value?: string;
  screenshotUrl?: string;
  description?: string;
}

interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  videoUrl?: string;
  status: 'draft' | 'ready' | 'generating' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export class WorkflowService {
  private workflows: Map<string, Workflow> = new Map();

  async createWorkflow(data: Partial<Workflow>): Promise<Workflow> {
    const workflow: Workflow = {
      id: uuidv4(),
      name: data.name || 'Untitled Workflow',
      description: data.description,
      steps: data.steps || [],
      videoUrl: data.videoUrl,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workflows.set(workflow.id, workflow);
    logger.info(`Workflow created: ${workflow.id}`);
    
    return workflow;
  }

  async listWorkflows(options: {
    page: number;
    limit: number;
    status?: string;
  }): Promise<{ workflows: Workflow[]; total: number; page: number; limit: number }> {
    let workflows = Array.from(this.workflows.values());

    if (options.status) {
      workflows = workflows.filter(w => w.status === options.status);
    }

    workflows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = workflows.length;
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedWorkflows = workflows.slice(startIndex, endIndex);

    return {
      workflows: paginatedWorkflows,
      total,
      page: options.page,
      limit: options.limit
    };
  }

  async getWorkflowById(id: string): Promise<Workflow | null> {
    return this.workflows.get(id) || null;
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const workflow = this.workflows.get(id);
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const updatedWorkflow: Workflow = {
      ...workflow,
      ...updates,
      id: workflow.id,
      createdAt: workflow.createdAt,
      updatedAt: new Date()
    };

    this.workflows.set(id, updatedWorkflow);
    logger.info(`Workflow updated: ${id}`);
    
    return updatedWorkflow;
  }

  async deleteWorkflow(id: string): Promise<void> {
    if (!this.workflows.has(id)) {
      throw new Error('Workflow not found');
    }

    this.workflows.delete(id);
    logger.info(`Workflow deleted: ${id}`);
  }

  async updateWorkflowStatus(id: string, status: Workflow['status']): Promise<Workflow> {
    return this.updateWorkflow(id, { status });
  }
}
