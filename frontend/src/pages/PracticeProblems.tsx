import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { useToastStore } from '../stores/toastStore';
import { useAuthStore } from '../stores/authStore';
import Editor from '@monaco-editor/react';
import { FaCheck, FaTimes, FaLightbulb, FaCode } from 'react-icons/fa';
import type { Concept } from '../types';

interface PracticeProblem {
  id: string;
  conceptId: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  examples: Array<{ input: string; output: string; explanation?: string }>;
  solution?: string;
  hints: string[];
}

export default function PracticeProblems() {
  const { conceptId } = useParams<{ conceptId?: string }>();
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<PracticeProblem | null>(null);
  const [userSolution, setUserSolution] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [completedProblems, setCompletedProblems] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { success, info, error: showError } = useToastStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchProblems();
    setUserSolution('');
    setTestResults([]);
    setShowSolution(false);
    setShowHints(false);
  }, [conceptId, selectedProblem?.id]);

  const fetchProblems = async () => {
    try {
      const response = await apiService.getProblems(conceptId);
      const fetchedProblems = (response.problems || []) as PracticeProblem[];
      
      if (fetchedProblems.length > 0) {
        setProblems(fetchedProblems);
        setSelectedProblem(fetchedProblems[0]);
      } else {
        // Fallback to mock data if API returns empty
        const mockProblems: PracticeProblem[] = [
      {
        id: 'prob-1',
        conceptId: conceptId || '1',
        title: 'Reverse an Array',
        description: 'Write a function to reverse an array in-place.',
        difficulty: 'easy',
        examples: [
          { input: '[1, 2, 3, 4]', output: '[4, 3, 2, 1]' },
          { input: '[5, 10, 15]', output: '[15, 10, 5]' },
        ],
        hints: [
          'Use two pointers',
          'Swap elements from both ends',
          'Continue until pointers meet',
        ],
        solution: `def reverse_array(arr):
    left = 0
    right = len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr`,
      },
      {
        id: 'prob-2',
        conceptId: conceptId || '1',
        title: 'Find Maximum Element',
        description: 'Find the maximum element in an array.',
        difficulty: 'easy',
        examples: [
          { input: '[3, 7, 2, 9, 1]', output: '9' },
          { input: '[-1, -5, -3]', output: '-1' },
        ],
        hints: [
          'Initialize with first element',
          'Compare with all other elements',
          'Update if you find a larger value',
        ],
        solution: `def find_max(arr):
    if not arr:
        return None
    max_val = arr[0]
    for num in arr:
        if num > max_val:
            max_val = num
    return max_val`,
      },
      {
        id: 'prob-3',
        conceptId: conceptId || '2',
        title: 'Two Sum',
        description: 'Given an array and a target, find two numbers that add up to target.',
        difficulty: 'medium',
        examples: [
          { input: '[2, 7, 11, 15], target=9', output: '[0, 1]' },
          { input: '[3, 2, 4], target=6', output: '[1, 2]' },
        ],
        hints: [
          'Use a hash map',
          'Store complement of each number',
          'Check if complement exists',
        ],
      },
      ];

        const filtered = conceptId
          ? mockProblems.filter((p) => p.conceptId === conceptId)
          : mockProblems;
        setProblems(filtered);
        if (filtered.length > 0) {
          setSelectedProblem(filtered[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error);
      // Use mock data as fallback
      const mockProblems: PracticeProblem[] = [
        {
          id: 'prob-1',
          conceptId: conceptId || '1',
          title: 'Reverse an Array',
          description: 'Write a function to reverse an array in-place.',
          difficulty: 'easy',
          examples: [
            { input: '[1, 2, 3, 4]', output: '[4, 3, 2, 1]' },
            { input: '[5, 10, 15]', output: '[15, 10, 5]' },
          ],
          hints: [
            'Use two pointers',
            'Swap elements from both ends',
            'Continue until pointers meet',
          ],
          solution: `def reverse_array(arr):
    left = 0
    right = len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr`,
        },
      ];
      setProblems(mockProblems);
      if (mockProblems.length > 0) {
        setSelectedProblem(mockProblems[0]);
      }
    }
  };

  const handleSubmit = async () => {
    if (!userSolution.trim()) {
      info('Please write a solution first');
      return;
    }
    if (!selectedProblem) return;

    try {
      setSubmitting(true);
      const response = await apiService.submitSolution(selectedProblem.id, {
        code: userSolution,
        language: 'python', // TODO: Add language selector
      });

      setTestResults(response.testResults || []);
      
      if (response.passed) {
        success(response.message || 'All test cases passed!');
        setCompletedProblems(new Set([...completedProblems, selectedProblem.id]));
      } else {
        const failedCount = (response.testResults || []).filter((tr: any) => !tr.passed).length;
        const totalCount = response.totalTests || (response.testResults || []).length;
        showError(response.message || `${failedCount} out of ${totalCount} test cases failed`);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to={conceptId ? `/concept/${conceptId}` : '/concepts'}
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 mb-4 inline-block"
          >
            ← Back
          </Link>
          <h1 className="text-4xl font-bold gradient-text mb-2">Practice Problems</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Solve coding challenges to master DSA concepts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problems List */}
          <div className="lg:col-span-1">
            <div className="glass-card p-4 mb-4">
              <h2 className="text-lg font-semibold mb-3">Problems</h2>
              <div className="space-y-2">
                {problems.map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => {
                      setSelectedProblem(problem);
                      setUserSolution('');
                      setShowSolution(false);
                      setShowHints(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedProblem?.id === problem.id
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100'
                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{problem.title}</span>
                      {completedProblems.has(problem.id) && (
                        <FaCheck className="text-green-600" />
                      )}
                    </div>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${difficultyColors[problem.difficulty]}`}
                    >
                      {problem.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Problem Details & Editor */}
          <div className="lg:col-span-2">
            {selectedProblem ? (
              <div className="space-y-6">
                {/* Problem Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedProblem.title}</h2>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[selectedProblem.difficulty]}`}
                      >
                        {selectedProblem.difficulty}
                      </span>
                    </div>
                    {completedProblems.has(selectedProblem.id) && (
                      <div className="flex items-center gap-2 text-green-600">
                        <FaCheck className="w-5 h-5" />
                        <span className="font-semibold">Completed</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {selectedProblem.description}
                  </p>

                  {/* Examples */}
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Examples:</h3>
                    {selectedProblem.examples.map((example, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-2">
                        <div className="text-sm">
                          <span className="font-medium">Input: </span>
                          <code className="text-indigo-600 dark:text-indigo-400">
                            {example.input}
                          </code>
                        </div>
                        <div className="text-sm mt-1">
                          <span className="font-medium">Output: </span>
                          <code className="text-green-600 dark:text-green-400">
                            {example.output}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hints */}
                  <div className="mb-4">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      <FaLightbulb />
                      <span>{showHints ? 'Hide' : 'Show'} Hints</span>
                    </button>
                    {showHints && (
                      <div className="mt-2 space-y-1">
                        {selectedProblem.hints.map((hint, idx) => (
                          <div
                            key={idx}
                            className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-sm"
                          >
                            {idx + 1}. {hint}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Code Editor */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Your Solution</h3>
                    <Link
                      to="/playground"
                      className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                    >
                      <FaCode />
                      Open in Playground
                    </Link>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                    <Editor
                      height="300px"
                      defaultLanguage="python"
                      language="python"
                      value={userSolution}
                      onChange={(value) => setUserSolution(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                      }}
                    />
                  </div>
                  {/* Test Results */}
                  {testResults.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Test Results:</h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {testResults.filter((r: any) => r.passed).length} / {testResults.length} passed
                        </span>
                      </div>
                      <div className="space-y-2">
                        {testResults.map((result: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg ${
                              result.passed
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {result.passed ? (
                                <FaCheck className="text-green-600 dark:text-green-400" />
                              ) : (
                                <FaTimes className="text-red-600 dark:text-red-400" />
                              )}
                              <span className="font-medium text-gray-900 dark:text-white">
                                Test Case {result.testCase}: {result.passed ? 'Passed ✓' : 'Failed ✗'}
                              </span>
                              {result.executionTime && (
                                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                                  {result.executionTime}ms
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 ml-7 space-y-1">
                              <div>
                                <span className="font-medium">Input: </span>
                                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                                  {result.input || '(none)'}
                                </code>
                              </div>
                              <div>
                                <span className="font-medium">Expected: </span>
                                <code className="bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs text-green-700 dark:text-green-300">
                                  {result.expected}
                                </code>
                              </div>
                              {!result.passed && (
                                <div>
                                  <span className="font-medium">Got: </span>
                                  <code className="bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded text-xs text-red-700 dark:text-red-300">
                                    {result.actual || result.error || '(no output)'}
                                  </code>
                                </div>
                              )}
                              {result.error && (
                                <div className="mt-1 text-red-600 dark:text-red-400">
                                  <span className="font-medium">Error: </span>
                                  {result.error}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !userSolution.trim()}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Solution'}
                    </button>
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {showSolution ? 'Hide' : 'Show'} Solution
                    </button>
                  </div>
                </motion.div>

                {/* Solution */}
                {showSolution && selectedProblem.solution && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                  >
                    <h3 className="text-lg font-semibold mb-3">Solution</h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                      <code>{selectedProblem.solution}</code>
                    </pre>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Select a problem to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

