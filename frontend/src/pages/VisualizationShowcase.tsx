import { useState } from 'react';
import { Link } from 'react-router-dom';
import ArrayVisualizer from '../visualizations/ArrayVisualizer';
import TreeVisualizer from '../visualizations/TreeVisualizer';
import StackQueueVisualizer from '../visualizations/StackQueueVisualizer';
import GraphVisualizer from '../visualizations/GraphVisualizer';

export default function VisualizationShowcase() {
  const [selectedType, setSelectedType] = useState<'array' | 'tree' | 'stack' | 'queue' | 'graph'>('array');
  const [arrayData, setArrayData] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [algorithmType, setAlgorithmType] = useState<'sort' | 'search'>('sort');
  const [searchTarget, setSearchTarget] = useState<number>(25);
  const [highlighted, setHighlighted] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchResult, setSearchResult] = useState<{ found: boolean; index?: number; message: string } | null>(null);

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
            <>
              <div className="mb-4 flex flex-wrap gap-4 items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setAlgorithmType('sort')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      algorithmType === 'sort'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Sorting
                  </button>
                  <button
                    onClick={() => setAlgorithmType('search')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      algorithmType === 'search'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Searching
                  </button>
                </div>
                
                {algorithmType === 'search' && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target:</label>
                      <input
                        type="number"
                        value={searchTarget}
                        onChange={(e) => setSearchTarget(Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        disabled={isAnimating}
                      />
                    </div>
                    <button
                      onClick={async () => {
                        setIsAnimating(true);
                        setHighlighted([]);
                        setSearchResult(null);
                        let found = false;
                        let foundIndex = -1;
                        
                        for (let i = 0; i < arrayData.length; i++) {
                          setHighlighted([i]);
                          await new Promise((resolve) => setTimeout(resolve, 500));
                          if (arrayData[i] === searchTarget) {
                            found = true;
                            foundIndex = i;
                            setHighlighted([i]);
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                            break;
                          }
                        }
                        
                        setSearchResult({
                          found,
                          index: foundIndex,
                          message: found 
                            ? `✅ Found ${searchTarget} at index ${foundIndex}!` 
                            : `❌ ${searchTarget} not found in the array.`
                        });
                        setIsAnimating(false);
                      }}
                      disabled={isAnimating}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isAnimating ? 'Animating...' : '▶ Linear Search'}
                    </button>
                    <button
                      onClick={async () => {
                        setIsAnimating(true);
                        const sortedArr = [...arrayData].sort((a, b) => a - b);
                        setArrayData(sortedArr);
                        setHighlighted([]);
                        setSearchResult(null);
                        let left = 0;
                        let right = sortedArr.length - 1;
                        let found = false;
                        let foundIndex = -1;
                        
                        while (left <= right) {
                          const mid = Math.floor((left + right) / 2);
                          setHighlighted([left, mid, right]);
                          await new Promise((resolve) => setTimeout(resolve, 500));
                          if (sortedArr[mid] === searchTarget) {
                            found = true;
                            foundIndex = mid;
                            setHighlighted([mid]);
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                            break;
                          } else if (sortedArr[mid] < searchTarget) {
                            left = mid + 1;
                          } else {
                            right = mid - 1;
                          }
                        }
                        
                        setSearchResult({
                          found,
                          index: foundIndex,
                          message: found 
                            ? `✅ Found ${searchTarget} at index ${foundIndex}!` 
                            : `❌ ${searchTarget} not found in the sorted array.`
                        });
                        setIsAnimating(false);
                      }}
                      disabled={isAnimating}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isAnimating ? 'Animating...' : '▶ Binary Search'}
                    </button>
                    <button
                      onClick={() => {
                        setArrayData([64, 34, 25, 12, 22, 11, 90]);
                        setHighlighted([]);
                        setSearchTarget(25);
                        setSearchResult(null);
                      }}
                      disabled={isAnimating}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>
              {searchResult && (
                <div className={`mb-4 p-4 rounded-lg ${
                  searchResult.found 
                    ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700' 
                    : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700'
                }`}>
                  <p className={`font-semibold ${
                    searchResult.found 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {searchResult.message}
                  </p>
                </div>
              )}
              <ArrayVisualizer
                data={arrayData}
                onDataChange={setArrayData}
                showControls={algorithmType === 'sort'}
                highlightIndices={highlighted}
                enableStepControl={algorithmType === 'search'}
              />
            </>
          )}
          {selectedType === 'tree' && (
            <TreeVisualizer 
              showDelete={true}
              showSearch={true}
            />
          )}
          {selectedType === 'stack' && <StackQueueVisualizer type="stack" />}
          {selectedType === 'queue' && <StackQueueVisualizer type="queue" />}
          {selectedType === 'graph' && (
            <GraphVisualizer 
              showDelete={true}
              showSearch={true}
            />
          )}
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

