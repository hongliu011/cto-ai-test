import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  videoUrl?: string;
}

interface WorkflowStep {
  id: string;
  order: number;
  action: string;
  target: string;
  value?: string;
  screenshotUrl?: string;
  description?: string;
}

interface GeneratedScript {
  id: string;
  workflowId: string;
  name: string;
  code: string;
  language: 'javascript' | 'python';
  framework: 'playwright' | 'puppeteer' | 'selenium';
  filePath: string;
  createdAt: Date;
}

export class AIScriptGeneratorService {
  private apiKey: string;
  private model: string;
  private outputDir: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-4-vision-preview';
    this.outputDir = process.env.SCRIPT_OUTPUT_DIR || './generated-scripts';
  }

  async generateScript(workflow: Workflow): Promise<GeneratedScript> {
    logger.info(`Generating script for workflow: ${workflow.id}`);

    const prompt = this.buildPrompt(workflow);
    const scriptCode = await this.callAI(prompt, workflow.steps);

    const script: GeneratedScript = {
      id: uuidv4(),
      workflowId: workflow.id,
      name: `${workflow.name.replace(/\s+/g, '_')}_${Date.now()}`,
      code: scriptCode,
      language: 'javascript',
      framework: 'playwright',
      filePath: '',
      createdAt: new Date()
    };

    script.filePath = await this.saveScript(script);
    
    logger.info(`Script generated successfully: ${script.id}`);
    return script;
  }

  private buildPrompt(workflow: Workflow): string {
    const stepsDescription = workflow.steps
      .map((step, index) => {
        return `Step ${index + 1}: ${step.action} on "${step.target}"${step.value ? ` with value "${step.value}"` : ''}${step.description ? ` - ${step.description}` : ''}`;
      })
      .join('\n');

    return `You are an expert RPA automation engineer. Generate a Playwright JavaScript script based on the following workflow:

Workflow Name: ${workflow.name}
${workflow.description ? `Description: ${workflow.description}` : ''}

Steps:
${stepsDescription}

Requirements:
1. Use Playwright with JavaScript
2. Include proper error handling and logging
3. Add waits for elements to be visible/clickable before interaction
4. Support reading local files (Excel, Word, etc.) if needed
5. Include screenshot capture for each step for verification
6. Make the script robust with retry mechanisms
7. Add clear comments for each step
8. Export a main function that can be called with test data

Generate ONLY the JavaScript code without any explanations or markdown formatting.`;
  }

  private async callAI(prompt: string, steps: WorkflowStep[]): Promise<string> {
    try {
      const messages: any[] = [
        {
          role: 'system',
          content: 'You are an expert RPA automation engineer specializing in Playwright automation scripts.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model.includes('vision') ? 'gpt-4-turbo' : this.model,
          messages,
          temperature: 0.3,
          max_tokens: 3000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const generatedCode = response.data.choices[0].message.content.trim();
      return this.cleanGeneratedCode(generatedCode);
    } catch (error: any) {
      logger.error('AI API call failed:', error.response?.data || error.message);
      
      return this.generateFallbackScript(steps);
    }
  }

  private cleanGeneratedCode(code: string): string {
    code = code.replace(/```javascript\n?/g, '').replace(/```\n?/g, '');
    code = code.trim();
    return code;
  }

  private generateFallbackScript(steps: WorkflowStep[]): string {
    const stepsCode = steps
      .map((step, index) => {
        const actionCode = this.generateActionCode(step);
        return `  // Step ${index + 1}: ${step.description || step.action}
  ${actionCode}
  await page.screenshot({ path: \`./screenshots/step_${index + 1}.png\` });
  console.log('Step ${index + 1} completed');
`;
      })
      .join('\n');

    return `const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runAutomation(testData = {}) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Starting automation...');
    
    // Ensure screenshots directory exists
    if (!fs.existsSync('./screenshots')) {
      fs.mkdirSync('./screenshots', { recursive: true });
    }

${stepsCode}
    
    console.log('Automation completed successfully!');
  } catch (error) {
    console.error('Automation failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

${this.generateActionCode.toString()}

module.exports = { runAutomation };

if (require.main === module) {
  runAutomation().catch(console.error);
}
`;
  }

  private generateActionCode(step: WorkflowStep): string {
    switch (step.action.toLowerCase()) {
      case 'navigate':
      case 'goto':
        return `await page.goto('${step.target}', { waitUntil: 'networkidle' });`;
      
      case 'click':
        return `await page.click('${step.target}');`;
      
      case 'fill':
      case 'type':
      case 'input':
        return `await page.fill('${step.target}', '${step.value || ''}');`;
      
      case 'select':
        return `await page.selectOption('${step.target}', '${step.value || ''}');`;
      
      case 'wait':
        return `await page.waitForSelector('${step.target}', { state: 'visible' });`;
      
      case 'screenshot':
        return `await page.screenshot({ path: '${step.value || 'screenshot.png'}' });`;
      
      default:
        return `// TODO: Implement action: ${step.action}`;
    }
  }

  private async saveScript(script: GeneratedScript): Promise<string> {
    await fs.mkdir(this.outputDir, { recursive: true });
    
    const fileName = `${script.name}.js`;
    const filePath = path.join(this.outputDir, fileName);
    
    await fs.writeFile(filePath, script.code, 'utf-8');
    
    return fileName;
  }
}
