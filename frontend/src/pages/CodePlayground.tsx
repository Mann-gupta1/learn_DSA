import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { apiService } from '../services/api';
import { useToastStore } from '../stores/toastStore';
import { useCodeHistoryStore } from '../stores/codeHistoryStore';
import { useAchievementStore } from '../stores/achievementStore';
import { useThemeStore } from '../stores/themeStore';
import { FaPlay, FaTerminal, FaClock, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

// Code templates for each language
const codeTemplates = {
    python: `# Python Example
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Test the function
numbers = [64, 34, 25, 12, 22, 11, 90]
result = bubble_sort(numbers)
print("Sorted array:", result)`,
    cpp: `// C++ Example
#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}

int main() {
    vector<int> numbers = {64, 34, 25, 12, 22, 11, 90};
    bubbleSort(numbers);
    cout << "Sorted array: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    return 0;
}`,
    javascript: `// JavaScript Example
function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

// Test the function
const numbers = [64, 34, 25, 12, 22, 11, 90];
const result = bubbleSort(numbers);
console.log("Sorted array:", result);`,
};

export default function CodePlayground() {
  const [searchParams] = useSearchParams();
  const conceptId = searchParams.get('concept');

  const [code, setCode] = useState(codeTemplates.python);
  const [language, setLanguage] = useState<'python' | 'cpp' | 'javascript'>('python');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [inputHeight, setInputHeight] = useState(10); // Percentage of right panel
  const [isResizingInput, setIsResizingInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const { success, error: showError } = useToastStore();
  const { addEntry, history } = useCodeHistoryStore();
  const { checkAchievements } = useAchievementStore();
  const { resolvedTheme } = useThemeStore();

  // Track if user has edited the code
  useEffect(() => {
    const currentTemplate = codeTemplates[language];
    setHasUserEdited(code.trim() !== currentTemplate.trim() && code.trim() !== '');
  }, [code, language]);

  // Handle horizontal resize (editor/output split)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100;
      
      // Constrain between 30% and 70%
      const constrainedWidth = Math.max(30, Math.min(70, newLeftWidth));
      setLeftWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Handle vertical resize (input/output split in right panel)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingInput || !rightPanelRef.current) return;
      
      const panel = rightPanelRef.current;
      const rect = panel.getBoundingClientRect();
      const newInputHeight = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Constrain between 5% and 40%
      const constrainedHeight = Math.max(5, Math.min(40, newInputHeight));
      setInputHeight(constrainedHeight);
    };

    const handleMouseUp = () => {
      setIsResizingInput(false);
    };

    if (isResizingInput) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingInput]);

  const executeCode = async () => {
    try {
      setLoading(true);
      setError(null);
      setOutput('');

      const response = await apiService.executeCode({
        code,
        language,
        input: input || undefined,
      });

      const run = response.run as { output?: string; error?: string; executionTime?: number };
      
      // Set execution time
      setExecutionTime(run.executionTime || null);
      
      if (run.error) {
        setError(run.error);
        setOutput(''); // Clear output on error
        showError('Code execution failed. Check the error details.');
        // Save to history even on error
        addEntry({
          code,
          language,
          input: input || undefined,
          output: undefined,
          error: run.error,
          conceptId: conceptId || undefined,
        });
      } else {
        setOutput(run.output || '');
        setError(null); // Clear error on success
        success(`Code executed successfully! ${run.executionTime ? `(${run.executionTime}ms)` : ''}`);
        // Save to history
        addEntry({
          code,
          language,
          input: input || undefined,
          output: run.output,
          conceptId: conceptId || undefined,
        });
        
        // Check achievements
        checkAchievements({ codeRuns: history.length + 1 });
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      let errorMessage = error.message || 'Failed to execute code';
      
      // Provide helpful message if backend is not running
      if (errorMessage.includes('Cannot connect to backend') || errorMessage.includes('Failed to fetch')) {
        errorMessage = `Backend server is not running. Please start it with:
1. Open a terminal
2. Run: cd backend
3. Run: npm run dev

The server should start on http://localhost:5000`;
      }
      
      setError(errorMessage);
      showError('Code execution failed. See error details below.');
    } finally {
      setLoading(false);
    }
  };

  // Handle language change - update code template
  const handleLanguageChange = (newLanguage: 'python' | 'cpp' | 'javascript') => {
    const currentTemplate = codeTemplates[language];
    // Only change code if it matches the current template or is empty (to preserve user edits)
    if (!hasUserEdited || code.trim() === currentTemplate.trim() || code.trim() === '') {
      setCode(codeTemplates[newLanguage]);
      setHasUserEdited(false);
    }
    setLanguage(newLanguage);
  };

  const loadExample = () => {
    setCode(codeTemplates[language]);
  };

  const editorTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light';

  return (
    <div className="min-h-screen">
      <div className="h-screen flex flex-col">
        {/* Header - Matching Website Theme */}
        <div className="border-b border-indigo-200/50 dark:border-indigo-800/50 glass-card rounded-none px-4 py-3">
          <div className="flex items-center justify-between max-w-[1600px] mx-auto">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold gradient-text">
                Code Playground
              </h1>
              <div className="h-4 w-px bg-indigo-300 dark:bg-indigo-700"></div>
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value as 'python' | 'cpp' | 'javascript';
                  handleLanguageChange(newLang);
                }}
                className="px-3 py-1.5 text-sm border border-indigo-200 dark:border-indigo-700 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-all"
              >
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadExample}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={executeCode}
                disabled={loading}
                className="px-4 py-1.5 text-sm font-medium bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-500/50"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Running</span>
                  </>
                ) : (
                  <>
                    <FaPlay className="w-3 h-3" />
                    <span>Run</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div 
          ref={containerRef}
          className="flex-1 flex flex-col lg:flex-row overflow-hidden relative"
        >
          <style>{`
            @media (max-width: 1023px) {
              .playground-panel {
                width: 100% !important;
                min-width: 100% !important;
              }
              .input-section {
                height: 120px !important;
                max-height: 120px !important;
              }
            }
          `}</style>
          {/* Code Editor Panel */}
          <div
            className="flex flex-col glass-card rounded-none border-r border-indigo-200/50 dark:border-indigo-800/50 playground-panel"
            style={{ width: `calc(${leftWidth}% - 1px)`, minWidth: '400px' }}
          >
            {/* Editor Header */}
            <div className="px-4 py-2 border-b border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-between bg-indigo-50/30 dark:bg-indigo-900/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Code</span>
              </div>
              {executionTime !== null && !error && (
                <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                  <FaClock className="w-3 h-3" />
                  <span>{executionTime}ms</span>
                </div>
              )}
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage={language === 'cpp' ? 'cpp' : language}
                language={language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={(value) => {
                  setCode(value || '');
                  setHasUserEdited(true);
                }}
                theme={editorTheme}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  readOnly: false,
                  cursorStyle: 'line',
                  fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                  tabSize: 2,
                  insertSpaces: true,
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                  },
                }}
              />
            </div>
          </div>

          {/* Resize Handle */}
          <div 
            className="hidden lg:flex w-1 cursor-col-resize items-center justify-center group relative z-10 bg-indigo-100/50 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
          >
            <div className="w-0.5 h-8 bg-indigo-400 dark:bg-indigo-600 rounded-full"></div>
          </div>

          {/* Output Panel */}
          <div
            ref={rightPanelRef}
            className="flex flex-col glass-card rounded-none playground-panel"
            style={{ width: `calc(${100 - leftWidth}% - 1px)`, minWidth: '400px' }}
          >
            {/* Input Section - Top of Right Panel */}
            <div
              className="flex flex-col border-b border-indigo-200/50 dark:border-indigo-800/50 bg-indigo-50/30 dark:bg-indigo-900/10 shrink-0 input-section"
              style={{ height: `${inputHeight}%`, minHeight: '80px', maxHeight: '40%' }}
            >
              <div className="px-4 py-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <FaTerminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Input</span>
                </div>
              </div>
              <div className="flex-1 px-4 pb-3 overflow-hidden min-h-0">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-full p-2 text-sm border border-indigo-200 dark:border-indigo-700 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 resize-none"
                  placeholder="Enter input here (optional)..."
                />
              </div>
            </div>

            {/* Resize Handle for Input/Output */}
            <div 
              className="hidden lg:flex h-1 cursor-row-resize items-center justify-center group relative z-10 bg-indigo-100/50 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors shrink-0"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizingInput(true);
              }}
            >
              <div className="w-8 h-0.5 bg-indigo-400 dark:bg-indigo-600 rounded-full"></div>
            </div>

            {/* Output Section - Bottom of Right Panel */}
            <div
              className="flex flex-col flex-1 overflow-hidden min-h-0"
            >
              {/* Output Header */}
              <div className="px-4 py-2 border-b border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-between bg-indigo-50/30 dark:bg-indigo-900/10">
                <div className="flex items-center gap-2">
                  <FaTerminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Output</span>
                </div>
                {error && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                    <FaExclamationTriangle className="w-3 h-3" />
                    <span>Error</span>
                  </div>
                )}
                {output && !error && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <FaCheckCircle className="w-3 h-3" />
                    <span>Success</span>
                  </div>
                )}
              </div>

              {/* Output Content */}
              <div className="flex-1 overflow-auto p-4 bg-white/50 dark:bg-gray-900/50">
                {loading ? (
                  <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                    <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-600 dark:border-indigo-500/30 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                    <span className="text-sm">Running code...</span>
                  </div>
                ) : error ? (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <FaExclamationTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Runtime Error</div>
                        <pre className="text-sm text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap wrap-break-word">
                          {error}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : output ? (
                  <pre className="text-sm text-gray-900 dark:text-gray-100 font-mono whitespace-pre-wrap wrap-break-word tab-size-4" style={{ tabSize: 4 }}>
                    {output}
                  </pre>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Run code to see output here
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

