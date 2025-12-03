import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCodeHistoryStore } from '../stores/codeHistoryStore';
import type { CodeHistoryEntry } from '../stores/codeHistoryStore';
import { formatRelativeTime, formatDate } from '../utils/formatters';
import { FaTrash, FaCode, FaPlay, FaTimes } from 'react-icons/fa';
import { useToastStore } from '../stores/toastStore';
import Editor from '@monaco-editor/react';

export default function CodeHistoryPage() {
  const { history, removeEntry, clearHistory } = useCodeHistoryStore();
  const { success } = useToastStore();
  const [selectedEntry, setSelectedEntry] = useState<CodeHistoryEntry | null>(null);
  const [filter, setFilter] = useState<'all' | 'python' | 'cpp' | 'javascript'>('all');

  const filteredHistory = history.filter(
    (entry) => filter === 'all' || entry.language === filter
  );

  const handleDelete = (id: string) => {
    removeEntry(id);
    success('Code history entry deleted');
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      clearHistory();
      success('All history cleared');
    }
  };

  const handleLoadCode = (entry: CodeHistoryEntry) => {
    setSelectedEntry(entry);
    success('Code loaded! Go to Playground to run it.');
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Code History</h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage your code execution history
            </p>
          </div>
          <Link
            to="/playground"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaCode className="inline mr-2" />
            Go to Playground
          </Link>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-6 flex items-center gap-4">
          <span className="text-sm font-medium">Filter:</span>
          {(['all', 'python', 'cpp', 'javascript'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setFilter(lang)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === lang
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {lang}
            </button>
          ))}
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Clear All
            </button>
          )}
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FaCode className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No code history yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start coding in the playground to see your history here
            </p>
            <Link
              to="/playground"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Playground
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredHistory.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        entry.language === 'python'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : entry.language === 'cpp'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {entry.language.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <FaTrash className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="bg-gray-900 rounded-lg p-3 mb-3">
                    <pre className="text-xs text-green-400 overflow-x-auto">
                      {entry.code.substring(0, 150)}
                      {entry.code.length > 150 && '...'}
                    </pre>
                  </div>
                </div>

                {entry.output && (
                  <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs font-medium text-green-800 dark:text-green-200 mb-1">
                      Output:
                    </p>
                    <pre className="text-xs text-green-700 dark:text-green-300 whitespace-pre-wrap">
                      {entry.output.substring(0, 100)}
                      {entry.output.length > 100 && '...'}
                    </pre>
                  </div>
                )}

                {entry.error && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">
                      Error:
                    </p>
                    <pre className="text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap">
                      {entry.error.substring(0, 100)}
                      {entry.error.length > 100 && '...'}
                    </pre>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleLoadCode(entry)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <FaPlay className="w-3 h-3" />
                    Load in Playground
                  </button>
                  <Link
                    to="/playground"
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    View
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Code Preview Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Code Preview</h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <Editor
                height="400px"
                defaultLanguage={selectedEntry.language === 'cpp' ? 'cpp' : selectedEntry.language}
                value={selectedEntry.code}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                }}
              />
              <div className="mt-4 flex gap-4">
                <Link
                  to="/playground"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center"
                >
                  Open in Playground
                </Link>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

