import { useState } from 'react';
import { Link } from 'react-router-dom';
import ArrayVisualizer from '../visualizations/ArrayVisualizer';
import TreeVisualizer from '../visualizations/TreeVisualizer';
import StackQueueVisualizer from '../visualizations/StackQueueVisualizer';
import GraphVisualizer from '../visualizations/GraphVisualizer';

export default function VisualizationShowcase() {
  const [selectedType, setSelectedType] = useState<'array' | 'tree' | 'stack' | 'queue' | 'graph'>('array');
  const [arrayData, setArrayData] = useState([64, 34, 25, 12, 22, 11, 90]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/concepts"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-4 inline-block"
        >
          ← Back to Concepts
        </Link>

        <div className="mb-6">
          <h1 className="text-4xl font-bold gradient-text mb-2">Visualization Showcase</h1>
          <p className="text-gray-700 dark:text-gray-300">
            Explore interactive visualizations for different data structures and algorithms
          </p>
        </div>

        {/* Visualization Type Selector */}
        <div className="glass-card rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('array')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'array'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Array
            </button>
            <button
              onClick={() => setSelectedType('tree')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'tree'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Binary Tree
            </button>
            <button
              onClick={() => setSelectedType('stack')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'stack'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Stack
            </button>
            <button
              onClick={() => setSelectedType('queue')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'queue'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Queue
            </button>
            <button
              onClick={() => setSelectedType('graph')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'graph'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Graph
            </button>
          </div>
        </div>

        {/* Render Selected Visualization */}
        <div className="mb-6">
          {selectedType === 'array' && (
            <ArrayVisualizer
              data={arrayData}
              onDataChange={setArrayData}
              showControls={true}
            />
          )}
          {selectedType === 'tree' && <TreeVisualizer />}
          {selectedType === 'stack' && <StackQueueVisualizer type="stack" />}
          {selectedType === 'queue' && <StackQueueVisualizer type="queue" />}
          {selectedType === 'graph' && <GraphVisualizer />}
        </div>

        {/* Info Section */}
        <div className="glass-card rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 gradient-text">About Visualizations</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Array Visualization</h3>
              <p>
                Arrays are linear data structures that store elements in contiguous memory locations.
                This visualization shows array elements as bars where you can see operations like
                insertion, deletion, and sorting in action.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Binary Tree Visualization</h3>
              <p>
                Binary trees are hierarchical data structures where each node has at most two
                children. This visualization demonstrates tree structure, node insertion, and
                traversal patterns.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Stack & Queue Visualization</h3>
              <p>
                Stacks follow LIFO (Last In First Out) while Queues follow FIFO (First In First
                Out) principles. These visualizations show how elements are added and removed from
                these data structures.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Graph Visualization</h3>
              <p>
                Graphs are collections of nodes connected by edges. This visualization demonstrates
                graph structure, node manipulation, and BFS/DFS traversal algorithms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

