import { useState } from 'react';
import { motion } from 'framer-motion';

interface StackQueueVisualizerProps {
  type: 'stack' | 'queue';
}

export default function StackQueueVisualizer({ type }: StackQueueVisualizerProps) {
  const [items, setItems] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addItem = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      if (type === 'stack') {
        setItems([...items, value]); // Push to end
      } else {
        setItems([...items, value]); // Enqueue to end
      }
      setInputValue('');
    }
  };

  const removeItem = () => {
    if (items.length === 0) return;
    
    if (type === 'stack') {
      setItems(items.slice(0, -1)); // Pop from end
    } else {
      setItems(items.slice(1)); // Dequeue from front
    }
  };

  const clearAll = () => {
    setItems([]);
  };

  const generateRandom = () => {
    const randomItems = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100) + 1);
    setItems(randomItems);
  };

  const isStack = type === 'stack';
  const topItem = isStack ? items[items.length - 1] : items[0];
  const operationName = isStack ? (items.length > 0 ? 'POP' : 'EMPTY') : (items.length > 0 ? 'DEQUEUE' : 'EMPTY');

  return (
    <div className="w-full glass-card p-6 rounded-xl overflow-hidden">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-4 gradient-text">
          {isStack ? 'Stack' : 'Queue'} Visualization
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {isStack
            ? 'Stack: Last In First Out (LIFO) - Elements are added/removed from the top'
            : 'Queue: First In First Out (FIFO) - Elements are added to rear, removed from front'}
        </p>

        <div className="flex flex-wrap gap-3 items-center mb-4">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
            className="px-4 py-2 glass-card border border-indigo-200 dark:border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addItem();
              }
            }}
          />
          <button
            onClick={addItem}
            className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isStack ? 'PUSH' : 'ENQUEUE'}
          </button>
          <button
            onClick={removeItem}
            disabled={items.length === 0}
            className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {operationName}
          </button>
          <button
            onClick={clearAll}
            className="px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Clear
          </button>
          <button
            onClick={generateRandom}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Generate Random
          </button>
        </div>
      </div>

      <div className="border-2 border-indigo-200/50 dark:border-indigo-800/50 rounded-xl p-6 min-h-[300px] bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 backdrop-blur-sm">
        {items.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-12 text-lg">
            {isStack ? 'Stack is empty' : 'Queue is empty'}
          </div>
        ) : (
          <div
            className={`flex flex-col gap-3 ${
              isStack ? 'items-center' : 'items-start'
            }`}
          >
            {isStack ? (
              // Stack: Show from top to bottom
              items
                .slice()
                .reverse()
                .map((item, index) => (
                  <motion.div
                    key={`${item}-${index}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-36 px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-center font-bold text-xl shadow-xl transition-all transform hover:scale-105 ${
                      index === 0 ? 'ring-4 ring-yellow-400 shadow-2xl scale-110' : 'shadow-lg'
                    }`}
                  >
                    {item}
                    {index === 0 && (
                      <div className="text-xs mt-2 text-yellow-200 font-semibold">TOP</div>
                    )}
                  </motion.div>
                ))
            ) : (
              // Queue: Show from front to rear
              items.map((item, index) => (
                <motion.div
                  key={`${item}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-center font-bold text-xl shadow-xl transition-all inline-block transform hover:scale-105 ${
                    index === 0 ? 'ring-4 ring-green-400 shadow-2xl' : index === items.length - 1 ? 'ring-2 ring-blue-400 shadow-lg' : 'shadow-lg'
                  }`}
                >
                  {item}
                  {index === 0 && <div className="text-xs mt-2 text-green-200 font-semibold">FRONT</div>}
                  {index === items.length - 1 && (
                    <div className="text-xs mt-2 text-blue-200 font-semibold">REAR</div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 glass-card px-4 py-2 rounded-lg">
        <p>
          <strong>Size:</strong> {items.length} | <strong>Top/Front:</strong>{' '}
          {topItem !== undefined ? topItem : 'N/A'}
        </p>
      </div>
    </div>
  );
}

