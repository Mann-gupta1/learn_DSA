import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ArrayVisualizer from '../visualizations/ArrayVisualizer';
import TreeVisualizer from '../visualizations/TreeVisualizer';
import StackQueueVisualizer from '../visualizations/StackQueueVisualizer';
import GraphVisualizer from '../visualizations/GraphVisualizer';

export default function VisualizationPage() {
  const { id } = useParams<{ id: string }>();
  const [arrayData, setArrayData] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [highlighted, setHighlighted] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [vizType, setVizType] = useState<'array' | 'tree' | 'stack' | 'queue' | 'graph'>('array');
  const [algorithmType, setAlgorithmType] = useState<'sort' | 'search'>('sort');
  const [searchTarget, setSearchTarget] = useState<number>(25);

  // Example: Animate bubble sort
  const animateBubbleSort = async () => {
    setIsAnimating(true);
    let arr = [...arrayData];
    const n = arr.length;
    const steps: { indices: number[]; action: string }[] = [];

    // Generate sort steps
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({ indices: [j, j + 1], action: 'compare' });
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({ indices: [j, j + 1], action: 'swap' });
        }
      }
    }

    // Animate steps
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setHighlighted(step.indices);

      if (step.action === 'swap') {
        const newArr = [...arrayData];
        [newArr[step.indices[0]], newArr[step.indices[1]]] = [
          newArr[step.indices[1]],
          newArr[step.indices[0]],
        ];
        setArrayData(newArr);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setHighlighted([]);
    setIsAnimating(false);
  };

  // Animate linear search
  const animateLinearSearch = async () => {
    setIsAnimating(true);
    const target = searchTarget;
    setHighlighted([]);

    for (let i = 0; i < arrayData.length; i++) {
      setHighlighted([i]);
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (arrayData[i] === target) {
        setHighlighted([i]);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        break;
      }
    }

    setIsAnimating(false);
  };

  // Animate binary search
  const animateBinarySearch = async () => {
    setIsAnimating(true);
    const sortedArr = [...arrayData].sort((a, b) => a - b);
    setArrayData(sortedArr);
    const target = searchTarget;
    let left = 0;
    let right = sortedArr.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      setHighlighted([left, mid, right]);
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (sortedArr[mid] === target) {
        setHighlighted([mid]);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        break;
      } else if (sortedArr[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    setIsAnimating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/concepts"
          className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
        >
          ← Back to Concepts
        </Link>

        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interactive Visualization</h1>
          <p className="text-gray-600">
            Explore different data structures and algorithms with interactive visualizations
          </p>
        </div>

        {/* Visualization Type Selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {(['array', 'tree', 'stack', 'queue', 'graph'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setVizType(type)}
                className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                  vizType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Render Selected Visualization */}
        <div className="mb-6">
          {vizType === 'array' && (
            <>
              <div className="mb-4 flex flex-wrap gap-4 items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setAlgorithmType('sort')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      algorithmType === 'sort'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Sorting
                  </button>
                  <button
                    onClick={() => setAlgorithmType('search')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      algorithmType === 'search'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Searching
                  </button>
                </div>
                
                {algorithmType === 'sort' ? (
                  <>
                    <button
                      onClick={animateBubbleSort}
                      disabled={isAnimating}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isAnimating ? 'Animating...' : '▶ Animate Bubble Sort'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Target:</label>
                      <input
                        type="number"
                        value={searchTarget}
                        onChange={(e) => setSearchTarget(Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                        disabled={isAnimating}
                      />
                    </div>
                    <button
                      onClick={animateLinearSearch}
                      disabled={isAnimating}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isAnimating ? 'Animating...' : '▶ Linear Search'}
                    </button>
                    <button
                      onClick={animateBinarySearch}
                      disabled={isAnimating}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isAnimating ? 'Animating...' : '▶ Binary Search'}
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => {
                    setArrayData([64, 34, 25, 12, 22, 11, 90]);
                    setHighlighted([]);
                    setSearchTarget(25);
                  }}
                  disabled={isAnimating}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Reset
                </button>
              </div>
              <ArrayVisualizer
                data={arrayData}
                onDataChange={setArrayData}
                highlightIndices={highlighted}
                enableStepControl={true}
              />
            </>
          )}
          {vizType === 'tree' && <TreeVisualizer />}
          {vizType === 'stack' && <StackQueueVisualizer type="stack" />}
          {vizType === 'queue' && <StackQueueVisualizer type="queue" />}
          {vizType === 'graph' && <GraphVisualizer />}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">About This Visualization</h2>
          <p className="text-gray-600 mb-2">
            This interactive visualization demonstrates array operations. You can:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Adjust array size and generate random arrays</li>
            <li>Watch step-by-step sorting animations</li>
            <li>See highlighted comparisons and swaps</li>
            <li>Experiment with different values</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

