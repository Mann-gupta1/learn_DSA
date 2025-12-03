import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { codeExecutor } from '../services/codeExecutor';

interface CodeExecutionRequest {
  code: string;
  language: 'python' | 'cpp' | 'javascript';
  input?: string;
}

/**
 * Execute code using our custom code executor
 */
export const executeCode = async (req: Request, res: Response) => {
  try {
    const { code, language, input = '' }: CodeExecutionRequest = req.body;
    const userId = (req as any).userId;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    // Validate language
    if (!['python', 'cpp', 'javascript'].includes(language)) {
      return res.status(400).json({ error: 'Invalid language. Supported: python, cpp, javascript' });
    }

    // Execute code using our custom executor
    const executionResult = await codeExecutor.execute(code, language, {
      timeout: 10000, // 10 seconds
      input: input || undefined,
    });

    // Save code run to database (only if user is logged in)
    let codeRun;
    if (userId) {
      codeRun = await prisma.codeRun.create({
        data: {
          userId,
          code,
          language,
          input: input || null,
          output: executionResult.output || null,
          error: executionResult.error || null,
          traceJson: executionResult.traceJson ? JSON.parse(JSON.stringify(executionResult.traceJson)) : null,
          executionTime: executionResult.executionTime,
        },
      });
    } else {
      // Return response for anonymous users (don't save to DB)
      codeRun = {
        id: `run-${Date.now()}`,
        userId: null,
        code,
        language,
        input: input || null,
        output: executionResult.output || null,
        error: executionResult.error || null,
        traceJson: executionResult.traceJson || undefined,
        executionTime: executionResult.executionTime,
        createdAt: new Date(),
      };
    }

    res.json({
      run: {
        id: codeRun.id,
        userId: codeRun.userId || null,
        code: codeRun.code,
        language: codeRun.language,
        input: codeRun.input || null,
        output: codeRun.output || null,
        error: codeRun.error || null,
        traceJson: codeRun.traceJson || null,
        executionTime: codeRun.executionTime || null,
        conceptId: codeRun.conceptId || null,
        createdAt: codeRun.createdAt instanceof Date
          ? codeRun.createdAt.toISOString()
          : new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error executing code:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to execute code',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
