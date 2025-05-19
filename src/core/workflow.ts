import { Task } from './task';
import { Logger } from '../utils/logger';

export interface WorkflowConfig {
  name: string;
  tasks: Task[];
  logger: Logger;
}

export class Workflow {
  private name: string;
  private tasks: Task[];
  private logger: Logger;

  constructor(config: WorkflowConfig) {
    this.name = config.name;
    this.tasks = config.tasks;
    this.logger = config.logger;
  }

  async execute(input: any = {}): Promise<any> {
    this.logger.info(`Starting workflow: ${this.name}`);
    let result = input;

    try {
      for (const task of this.tasks) {
        this.logger.info(`Executing task: ${task.type}`);
        result = await task.execute(result);
        this.logger.info(`Task completed: ${task.type}`);
      }

      this.logger.info(`Workflow completed: ${this.name}`);
      return result;
    } catch (error) {
      this.logger.error(`Workflow failed: ${this.name}`, error);
      throw error;
    }
  }

  getName(): string {
    return this.name;
  }

  getTasks(): Task[] {
    return [...this.tasks];
  }
} 