export type TaskType = 'AI_ANALYSIS' | 'BLOCKCHAIN_TRANSACTION';

export interface TaskConfig {
  type: TaskType;
  execute: (input: any) => Promise<any>;
}

export class Task {
  private type: TaskType;
  private execute: (input: any) => Promise<any>;

  constructor(config: TaskConfig) {
    this.type = config.type;
    this.execute = config.execute;
  }

  getType(): TaskType {
    return this.type;
  }

  async run(input: any): Promise<any> {
    return this.execute(input);
  }
} 