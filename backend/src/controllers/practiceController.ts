import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { codeExecutor } from '../services/codeExecutor';

export const getProblems = async (req: Request, res: Response) => {
  try {
    const { conceptId, difficulty } = req.query;

    const where: any = {};
    if (conceptId) where.conceptId = conceptId as string;
    if (difficulty) where.difficulty = difficulty as string;

    const problems = await prisma.practiceProblem.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: {
        concept: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    res.json({
      problems: problems.map((problem) => ({
        id: problem.id,
        conceptId: problem.conceptId,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        examples: problem.examples,
        hints: problem.hints,
        solution: problem.solution || '',
        testCases: problem.testCases,
        order: problem.order,
      })),
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
};

export const getProblemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const problem = await prisma.practiceProblem.findUnique({
      where: { id },
      include: {
        concept: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json({
      problem: {
        id: problem.id,
        conceptId: problem.conceptId,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        examples: problem.examples,
        hints: problem.hints,
        solution: problem.solution || '',
        testCases: problem.testCases,
        order: problem.order,
        concept: problem.concept,
      },
    });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
};

export const submitSolution = async (req: Request, res: Response) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = (req as any).userId;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const problem = await prisma.practiceProblem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const testCases = problem.testCases as Array<{ input: string; expectedOutput: string }>;
    
    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ error: 'No test cases available for this problem' });
    }

    // Run code against all test cases
    const testResults = [];
    let allPassed = true;
    let firstError: string | null = null;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      try {
        // Execute code with test case input
        const executionResult = await codeExecutor.execute(code, language, {
          timeout: 10000, // 10 seconds per test case
          input: testCase.input || undefined,
        });

        // Normalize outputs for comparison (trim whitespace)
        const actualOutput = executionResult.output.trim();
        const expectedOutput = testCase.expectedOutput.trim();

        // Check if execution had errors
        if (executionResult.error) {
          allPassed = false;
          testResults.push({
            testCase: i + 1,
            passed: false,
            input: testCase.input,
            expected: expectedOutput,
            actual: executionResult.error,
            error: executionResult.error,
          });
          if (!firstError) {
            firstError = `Test case ${i + 1}: ${executionResult.error}`;
          }
          continue;
        }

        // Compare outputs
        const passed = actualOutput === expectedOutput;
        if (!passed) {
          allPassed = false;
          if (!firstError) {
            firstError = `Test case ${i + 1} failed: expected "${expectedOutput}", got "${actualOutput}"`;
          }
        }

        testResults.push({
          testCase: i + 1,
          passed,
          input: testCase.input,
          expected: expectedOutput,
          actual: actualOutput,
          executionTime: executionResult.executionTime,
        });
      } catch (error: any) {
        allPassed = false;
        const errorMessage = error.message || 'Execution failed';
        testResults.push({
          testCase: i + 1,
          passed: false,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: errorMessage,
          error: errorMessage,
        });
        if (!firstError) {
          firstError = `Test case ${i + 1}: ${errorMessage}`;
        }
      }
    }

    // Save code run to database
    if (userId) {
      await prisma.codeRun.create({
        data: {
          userId,
          code,
          language,
          conceptId: problem.conceptId,
          output: allPassed
            ? 'All test cases passed!'
            : firstError || 'Some test cases failed',
          error: allPassed ? null : firstError,
          executionTime: testResults.reduce((sum, tr) => sum + (tr.executionTime || 0), 0),
        },
      });
    }

    res.json({
      passed: allPassed,
      message: allPassed
        ? 'Congratulations! All test cases passed! 🎉'
        : `${testResults.filter(tr => !tr.passed).length} out of ${testCases.length} test cases failed.`,
      testResults,
      totalTests: testCases.length,
      passedTests: testResults.filter(tr => tr.passed).length,
    });
  } catch (error: any) {
    console.error('Error submitting solution:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to submit solution',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
