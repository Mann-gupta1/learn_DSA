// Code Run Model
export interface CodeRun {
  id: string;
  userId?: string;
  code: string;
  language: 'python' | 'cpp' | 'javascript' | 'go';
  input: string;
  output: string;
  error?: string;
  traceJson?: Array<{
    action: string;
    indices?: number[];
    data?: unknown;
    [key: string]: unknown;
  }>;
  executionTime?: number; // milliseconds
  createdAt: Date;
}

