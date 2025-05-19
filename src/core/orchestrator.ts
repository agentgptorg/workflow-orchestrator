import { Workflow } from './workflow';
import { Task } from './task';
import { Logger } from '../utils/logger';
import { OpenAI } from 'openai';
import { ethers } from 'ethers';
import { z } from 'zod';

export interface OrchestratorConfig {
  apiKey: string;
  blockchainProvider: string;
  logger?: Logger;
}

export interface WorkflowConfig {
  name: string;
  steps: Array<{
    type: 'AI_ANALYSIS' | 'BLOCKCHAIN_TRANSACTION';
    config: Record<string, any>;
  }>;
}

export class WorkflowOrchestrator {
  private openai: OpenAI;
  private provider: ethers.Provider;
  private logger: Logger;

  constructor(config: OrchestratorConfig) {
    this.openai = new OpenAI({ apiKey: config.apiKey });
    this.provider = new ethers.JsonRpcProvider(config.blockchainProvider);
    this.logger = config.logger || new Logger();
  }

  async createWorkflow(config: WorkflowConfig): Promise<Workflow> {
    this.validateWorkflowConfig(config);
    
    const tasks = await Promise.all(
      config.steps.map(async (step) => {
        switch (step.type) {
          case 'AI_ANALYSIS':
            return new Task({
              type: 'AI_ANALYSIS',
              execute: async (input) => {
                const completion = await this.openai.chat.completions.create({
                  model: step.config.model || 'gpt-4',
                  messages: [{ role: 'user', content: input }],
                });
                return completion.choices[0].message.content;
              },
            });
          case 'BLOCKCHAIN_TRANSACTION':
            return new Task({
              type: 'BLOCKCHAIN_TRANSACTION',
              execute: async (input) => {
                // Implement blockchain transaction logic
                return await this.executeBlockchainTransaction(input, step.config);
              },
            });
          default:
            throw new Error(`Unknown task type: ${step.type}`);
        }
      })
    );

    return new Workflow({
      name: config.name,
      tasks,
      logger: this.logger,
    });
  }

  private validateWorkflowConfig(config: WorkflowConfig): void {
    const schema = z.object({
      name: z.string().min(1),
      steps: z.array(
        z.object({
          type: z.enum(['AI_ANALYSIS', 'BLOCKCHAIN_TRANSACTION']),
          config: z.record(z.any()),
        })
      ),
    });

    schema.parse(config);
  }

  private async executeBlockchainTransaction(
    input: any,
    config: Record<string, any>
  ): Promise<string> {
    try {
      // Implement blockchain transaction logic here
      // This is a placeholder implementation
      const signer = new ethers.Wallet(config.privateKey, this.provider);
      const tx = await signer.sendTransaction({
        to: config.to,
        value: ethers.parseEther(config.value),
      });
      return tx.hash;
    } catch (error) {
      this.logger.error('Blockchain transaction failed', error);
      throw error;
    }
  }
} 