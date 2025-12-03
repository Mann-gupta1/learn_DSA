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
              <div className="mb-4">
                <button
                  onClick={animateBubbleSort}
                  disabled={isAnimating}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 mr-4"
                >
                  {isAnimating ? 'Animating...' : '▶ Animate Bubble Sort'}
                </button>
                <button
                  onClick={() => setArrayData([64, 34, 25, 12, 22, 11, 90])}
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

