import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRedo, FaStar } from 'react-icons/fa';
import ArrayVisualizer from './ArrayVisualizer';
import GraphVisualizer from './GraphVisualizer';
import TreeVisualizer from './TreeVisualizer';

interface AlgorithmStep {
  type: 'array' | 'graph' | 'tree' | 'recursion' | 'stack' | 'queue';
  data?: number[];
  indices?: number[];
  graphState?: {
    nodes: Array<{ id: string; label: string; x: number; y: number }>;
    edges: Array<{ source: string; target: string }>;
    visited: string[];
    queue: string[];
    current: string | null;
  };
  treeState?: {
    root: any;
    visited: number[];
    current: number | null;
  };
  recursionStack?: Array<{
    function: string;
    params: any;
    returnValue?: any;
    depth: number;
  }>;
  action: string;
  description: string;
  comparison?: { left: number; right: number; result: boolean };
  swap?: { from: number; to: number };
}

// Graph Step Visualizer Component
function GraphStepVisualizer({ graphState }: { graphState: AlgorithmStep['graphState'] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !graphState || !graphState.nodes || !graphState.edges) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Add gradients and filters
    const defs = svg.append('defs');
    
    // Node gradient
    const nodeGradient = defs.append('linearGradient')
      .attr('id', 'nodeGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    nodeGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#6366f1')
      .attr('stop-opacity', 1);
    nodeGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8b5cf6')
      .attr('stop-opacity', 1);
    
    // Visited gradient
    const visitedGradient = defs.append('linearGradient')
      .attr('id', 'visitedGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    visitedGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 1);
    visitedGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#059669')
      .attr('stop-opacity', 1);
    
    // Current gradient
    const currentGradient = defs.append('linearGradient')
      .attr('id', 'currentGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    currentGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f59e0b')
      .attr('stop-opacity', 1);
    currentGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f97316')
      .attr('stop-opacity', 1);
    
    // Queue gradient
    const queueGradient = defs.append('linearGradient')
      .attr('id', 'queueGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    queueGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#6366f1')
      .attr('stop-opacity', 1);
    queueGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4f46e5')
      .attr('stop-opacity', 1);
    
    // Glow filter
    const glowFilter = defs.append('filter')
      .attr('id', 'glow');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const width = svgRef.current.clientWidth || 600;
    const height = 400;

    // Draw edges
    if (graphState.edges && Array.isArray(graphState.edges)) {
      graphState.edges.forEach((edge) => {
        const sourceNode = graphState.nodes?.find((n) => n.id === edge.source);
        const targetNode = graphState.nodes?.find((n) => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        const isHighlighted = graphState.visited?.includes(edge.source) && 
                             graphState.visited?.includes(edge.target);

        svg
          .append('line')
          .attr('x1', sourceNode.x)
          .attr('y1', sourceNode.y)
          .attr('x2', targetNode.x)
          .attr('y2', targetNode.y)
          .attr('stroke', isHighlighted ? '#10b981' : '#6366f1')
          .attr('stroke-width', isHighlighted ? 3.5 : 2.5)
          .attr('opacity', isHighlighted ? 1 : 0.6)
          .attr('stroke-linecap', 'round');
      });
    }

    // Draw nodes
    if (graphState.nodes && Array.isArray(graphState.nodes)) {
      graphState.nodes.forEach((node) => {
        const isVisited = graphState.visited?.includes(node.id) || false;
        const isCurrent = graphState.current === node.id;
        const isInQueue = graphState.queue?.includes(node.id) || false;

        let fillGradient = 'url(#nodeGradient)';
        let strokeColor = '#6366f1';
        let strokeWidth = 2.5;
        let filter = 'none';

        if (isCurrent) {
          fillGradient = 'url(#currentGradient)';
          strokeColor = '#f59e0b';
          strokeWidth = 3;
          filter = 'url(#glow)';
        } else if (isVisited) {
          fillGradient = 'url(#visitedGradient)';
          strokeColor = '#10b981';
          strokeWidth = 3;
          filter = 'url(#glow)';
        } else if (isInQueue) {
          fillGradient = 'url(#queueGradient)';
          strokeColor = '#6366f1';
          strokeWidth = 2.5;
        }

        const nodeGroup = svg
          .append('g')
          .attr('transform', `translate(${node.x},${node.y})`);

        nodeGroup
          .append('circle')
          .attr('r', 28)
          .attr('fill', fillGradient)
          .attr('stroke', strokeColor)
          .attr('stroke-width', strokeWidth)
          .attr('filter', filter);

        nodeGroup
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', 'white')
          .attr('font-size', '16px')
          .attr('font-weight', 'bold')
          .attr('text-shadow', '0 1px 2px rgba(0,0,0,0.3)')
          .text(node.label);
      });
    }
  }, [graphState]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 w-full overflow-x-auto">
        <svg
          ref={svgRef}
          width="100%"
          height="400"
          viewBox="0 0 600 400"
          preserveAspectRatio="xMidYMid meet"
          className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 min-w-[500px]"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
            <div className="mt-4 flex flex-wrap gap-3">
          {graphState.visited && (
            <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-300 dark:border-green-700">
              <div className="text-xs font-medium text-green-800 dark:text-green-300 mb-1">Visited</div>
              <div className="text-sm font-bold text-green-900 dark:text-green-200">
                {graphState.visited.length > 0 ? graphState.visited.join(' → ') : 'None'}
              </div>
            </div>
          )}
          {graphState.queue && graphState.queue.length > 0 && (
            <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
              <div className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">Queue</div>
              <div className="text-sm font-bold text-blue-900 dark:text-blue-200">
                [{graphState.queue.join(', ')}]
              </div>
            </div>
          )}
          {graphState.current && (
            <div className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
              <div className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">Current</div>
              <div className="text-sm font-bold text-yellow-900 dark:text-yellow-200">
                {graphState.current}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface AlgorithmVisualizerProps {
  conceptSlug: string;
  conceptTitle: string;
  initialData?: number[];
}

export default function AlgorithmVisualizer({
  conceptSlug,
  conceptTitle,
  initialData = [64, 34, 25, 12, 22, 11, 90],
}: AlgorithmVisualizerProps) {
  const [data, setData] = useState<number[]>(initialData);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(3);
  const [currentDescription, setCurrentDescription] = useState('');
  const [visualizationType, setVisualizationType] = useState<'array' | 'graph' | 'tree' | 'recursion'>('array');

  // Generate algorithm steps based on concept type
  useEffect(() => {
    if (conceptSlug && initialData.length > 0) {
      try {
        const generatedSteps = generateSteps();
        if (generatedSteps.length > 0) {
          setSteps(generatedSteps);
          setCurrentStep(0);
          setCurrentDescription(generatedSteps[0]?.description || '');
          setVisualizationType(generatedSteps[0]?.type || 'array');
        } else {
          // Fallback to default steps
          setSteps([{
            type: 'array',
            data: [...initialData],
            indices: [],
            action: 'init',
            description: 'Ready to visualize algorithm',
          }]);
        }
      } catch (error) {
        console.error('Error generating steps:', error);
        // Fallback to default steps
        setSteps([{
          type: 'array',
          data: [...initialData],
          indices: [],
          action: 'init',
          description: 'Ready to visualize algorithm',
        }]);
        setCurrentDescription('Error loading visualization');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conceptSlug, initialData]);

  const generateSteps = (): AlgorithmStep[] => {
    if (!conceptSlug) {
      return [{
        type: 'array',
        data: [...initialData],
        indices: [],
        action: 'init',
        description: 'Ready to visualize algorithm',
      }];
    }
    
    const slug = conceptSlug.toLowerCase();
    const title = conceptTitle.toLowerCase();
    let algorithmSteps: AlgorithmStep[] = [];

    // Searching algorithms
    if (slug.includes('linear-search') || slug.includes('sequential-search') || (title.includes('linear') && title.includes('search'))) {
      algorithmSteps = generateLinearSearchSteps([...initialData]);
    } else if (slug.includes('binary-search') || (title.includes('binary') && title.includes('search'))) {
      algorithmSteps = generateBinarySearchSteps([...initialData]);
    }
    // Sorting algorithms
    else if (slug.includes('bubble-sort') || title.includes('bubble')) {
      algorithmSteps = generateBubbleSortSteps([...initialData]);
    } else if (slug.includes('selection-sort') || title.includes('selection')) {
      algorithmSteps = generateSelectionSortSteps([...initialData]);
    } else if (slug.includes('insertion-sort') || title.includes('insertion')) {
      algorithmSteps = generateInsertionSortSteps([...initialData]);
    } else if (slug.includes('merge-sort') || title.includes('merge')) {
      algorithmSteps = generateMergeSortSteps([...initialData]);
    } else if (slug.includes('quick-sort') || title.includes('quick')) {
      algorithmSteps = generateQuickSortSteps([...initialData]);
    } else if (slug.includes('heap-sort') || title.includes('heap')) {
      algorithmSteps = generateHeapSortSteps([...initialData]);
    }
    // Graph algorithms
    else if (slug.includes('bfs') || slug.includes('breadth-first') || (slug.includes('graph') && title.includes('bfs'))) {
      algorithmSteps = generateBFSSteps();
    } else if (slug.includes('dfs') || slug.includes('depth-first') || (slug.includes('graph') && title.includes('dfs'))) {
      algorithmSteps = generateDFSSteps();
    } else if (slug.includes('dijkstra')) {
      algorithmSteps = generateDijkstraSteps();
    }
    // Tree algorithms
    else if (slug.includes('tree') && (slug.includes('preorder') || slug.includes('inorder') || slug.includes('postorder'))) {
      algorithmSteps = generateTreeTraversalSteps(slug);
    } else if (slug.includes('tree') && (slug.includes('insert') || title.includes('insert'))) {
      algorithmSteps = generateTreeInsertionSteps();
    } else if (slug.includes('tree') && (slug.includes('delete') || slug.includes('remove') || title.includes('delete') || title.includes('remove'))) {
      algorithmSteps = generateTreeDeletionSteps();
    }
    // Graph operations
    else if (slug.includes('graph') && (slug.includes('insert') || title.includes('insert'))) {
      algorithmSteps = generateGraphInsertionSteps();
    } else if (slug.includes('graph') && (slug.includes('delete') || slug.includes('remove') || title.includes('delete') || title.includes('remove'))) {
      algorithmSteps = generateGraphDeletionSteps();
    }
    // Recursion
    else if (slug.includes('recursion') || slug.includes('recursive')) {
      algorithmSteps = generateRecursionSteps();
    }
    // Array operations
    else if (slug.includes('array')) {
      algorithmSteps = generateArrayOperationSteps([...initialData]);
    }
    // Default: try to detect from title
    else {
      algorithmSteps = generateDefaultSteps([...initialData], slug, title);
    }

    return algorithmSteps;
  };

  // ========== SEARCHING ALGORITHMS ==========
  const generateLinearSearchSteps = (arr: number[]): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const target = arr[Math.floor(arr.length / 2)]; // Use middle element as target for demo
    
    steps.push({
      type: 'array',
      data: [...arr],
      indices: [],
      action: 'init',
      description: `🚀 Starting Linear Search: Looking for value ${target}`,
    });

    let found = false;
    let foundIndex = -1;

    for (let i = 0; i < arr.length; i++) {
      steps.push({
        type: 'array',
        data: [...arr],
        indices: [i],
        action: 'compare',
        description: `🔍 Checking index ${i}: arr[${i}] = ${arr[i]}`,
        comparison: { left: arr[i], right: target, result: arr[i] === target },
      });

      if (arr[i] === target) {
        found = true;
        foundIndex = i;
        steps.push({
          type: 'array',
          data: [...arr],
          indices: [i],
          action: 'found',
          description: `✅ Found! Value ${target} is at index ${i}`,
        });
        break;
      } else {
        steps.push({
          type: 'array',
          data: [...arr],
          indices: [i],
          action: 'notmatch',
          description: `❌ ${arr[i]} ≠ ${target}, continuing search...`,
        });
      }
    }

    if (!found) {
      steps.push({
        type: 'array',
        data: [...arr],
        indices: [],
        action: 'notfound',
        description: `❌ Value ${target} not found in array`,
      });
    } else {
      steps.push({
        type: 'array',
        data: [...arr],
        indices: [foundIndex],
        action: 'complete',
        description: `🎉 Search complete! Found ${target} at index ${foundIndex}`,
      });
    }

    return steps;
  };

  const generateBinarySearchSteps = (arr: number[]): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    // Sort array first for binary search
    const sortedArr = [...arr].sort((a, b) => a - b);
    const target = sortedArr[Math.floor(sortedArr.length / 2)]; // Use middle element as target
    
    steps.push({
      type: 'array',
      data: [...sortedArr],
      indices: [],
      action: 'init',
      description: `🚀 Starting Binary Search: Looking for value ${target} in sorted array [${sortedArr.join(', ')}]`,
    });

    let left = 0;
    let right = sortedArr.length - 1;
    let found = false;
    let foundIndex = -1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      
      steps.push({
        type: 'array',
        data: [...sortedArr],
        indices: [left, mid, right],
        action: 'range',
        description: `📊 Search range: [${left}...${right}], checking middle index ${mid}`,
      });

      steps.push({
        type: 'array',
        data: [...sortedArr],
        indices: [mid],
        action: 'compare',
        description: `🔍 Comparing arr[${mid}] = ${sortedArr[mid]} with target ${target}`,
        comparison: { left: sortedArr[mid], right: target, result: sortedArr[mid] === target },
      });

      if (sortedArr[mid] === target) {
        found = true;
        foundIndex = mid;
        steps.push({
          type: 'array',
          data: [...sortedArr],
          indices: [mid],
          action: 'found',
          description: `✅ Found! Value ${target} is at index ${mid}`,
        });
        break;
      } else if (sortedArr[mid] < target) {
        steps.push({
          type: 'array',
          data: [...sortedArr],
          indices: [mid],
          action: 'right',
          description: `➡️ ${sortedArr[mid]} < ${target}, searching right half [${mid + 1}...${right}]`,
        });
        left = mid + 1;
      } else {
        steps.push({
          type: 'array',
          data: [...sortedArr],
          indices: [mid],
          action: 'left',
          description: `⬅️ ${sortedArr[mid]} > ${target}, searching left half [${left}...${mid - 1}]`,
        });
        right = mid - 1;
      }
    }

    if (!found) {
      steps.push({
        type: 'array',
        data: [...sortedArr],
        indices: [],
        action: 'notfound',
        description: `❌ Value ${target} not found in array`,
      });
    } else {
      steps.push({
        type: 'array',
        data: [...sortedArr],
        indices: [foundIndex],
        action: 'complete',
        description: `🎉 Search complete! Found ${target} at index ${foundIndex}`,
      });
    }

    return steps;
  };

  // ========== SORTING ALGORITHMS ==========
  const generateBubbleSortSteps = (arr: number[]): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const n = arr.length;
    
    steps.push({
      type: 'array',
      data: [...arr],
      indices: [],
      action: 'init',
      description: `🚀 Starting Bubble Sort with ${n} elements`,
    });

    for (let i = 0; i < n - 1; i++) {
      steps.push({
        type: 'array',
        data: [...arr],
        indices: [],
        action: 'pass',
        description: `📊 Pass ${i + 1}: Comparing adjacent elements`,
      });

      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          type: 'array',
          data: [...arr],
          indices: [j, j + 1],
          action: 'compare',
          description: `🔍 Comparing arr[${j}] = ${arr[j]} with arr[${j + 1}] = ${arr[j + 1]}`,
          comparison: { left: arr[j], right: arr[j + 1], result: arr[j] > arr[j + 1] },
        });

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({
            type: 'array',
            data: [...arr],
            indices: [j, j + 1],
            action: 'swap',
            description: `🔄 Swapping: ${arr[j + 1]} ↔ ${arr[j]}`,
            swap: { from: j, to: j + 1 },
          });
        }
      }

      steps.push({
        type: 'array',
        data: [...arr],
        indices: [n - i - 1],
        action: 'sorted',
        description: `✅ Element at position ${n - i - 1} is now in correct position`,
      });
    }

    steps.push({
      type: 'array',
      data: [...arr],
      indices: [],
      action: 'complete',
      description: '🎉 Array is now sorted!',
    });

    return steps;
  };

  const generateSelectionSortSteps = (arr: number[]): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const n = arr.length;

    steps.push({
      type: 'array',
      data: [...arr],
      indices: [],
      action: 'init',
      description: `🚀 Starting Selection Sort: Finding minimum in unsorted portion`,
    });

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      
      steps.push({
        type: 'array',
        data: [...arr],
        indices: [i],
        action: 'select',
        description: `📊 Pass ${i + 1}: Starting with index ${i} as minimum`,
      });

      for (let j = i + 1; j < n; j++) {
        steps.push({
          type: 'array',
          data: [...arr],
          indices: [minIdx, j],
          action: 'compare',
          description: `🔍 Comparing arr[${minIdx}] = ${arr[minIdx]} with arr[${j}] = ${arr[j]}`,
          comparison: { left: arr[minIdx], right: arr[j], result: arr[j] < arr[minIdx] },
        });

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          steps.push({
            type: 'array',
            data: [...arr],
            indices: [minIdx],
            action: 'newmin',
            description: `✨ New minimum found at index ${j}: ${arr[j]}`,
          });
        }
      }

      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        steps.push({
          type: 'array',
          data: [...arr],
          indices: [i, minIdx],
          action: 'swap',
          description: `🔄 Swapping minimum ${arr[i]} to position ${i}`,
          swap: { from: minIdx, to: i },
        });
      }

      steps.push({
        type: 'array',
        data: [...arr],
        indices: [i],
        action: 'sorted',
        description: `✅ Position ${i} now contains the correct element`,
      });
    }

    steps.push({
      type: 'array',
      data: [...arr],
      indices: [],
      action: 'complete',
      description: '🎉 Array is now sorted!',
    });

    return steps;
  };

  const generateInsertionSortSteps = (arr: number[]): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const n = arr.length;

    steps.push({
      type: 'array',
      data: [...arr],
      indices: [],
      action: 'init',
      description: '🚀 Starting Insertion Sort: Building sorted array one element at a time',
    });

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      steps.push({
        type: 'array',
        data: [...arr],
        indices: [i],
        action: 'select',
        description: `📊 Processing element at index ${i}: ${key}`,
      });

      while (j >= 0 && arr[j] > key) {
        steps.push({
          type: 'array',
          data: [...arr],
          indices: [j, j + 1],
          action: 'compare',
          description: `🔍 Comparing ${arr[j]} > ${key}? Yes, shifting...`,
        });

        arr[j + 1] = arr[j];
        steps.push({
          type: 'array',
          data: [...arr],
          indices: [j + 1],
          action: 'shift',
          description: `➡️ Shifting ${arr[j]} to position ${j + 1}`,
        });

        j--;
      }

      arr[j + 1] = key;
      steps.push({
        type: 'array',
        data: [...arr],
        indices: [j + 1],
        action: 'insert',
        description: `✨ Inserting ${key} at position ${j + 1}`,
      });
    }

    steps.push({
      type: 'array',
      data: [...arr],
      indices: [],
      action: 'complete',
      description: '🎉 Array is now sorted!',
    });

    return steps;
  };

  const generateMergeSortSteps = (arr: number[]): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    
    steps.push({
      type: 'array',
      data: [...arr],
      indices: [],
      action: 'init',
      description: '🚀 Starting Merge Sort: Divide and conquer approach',
    });

    const merge = (arr: number[], left: number, mid: number, right: number) => {
      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);
      
      steps.push({
        type: 'array',
        data: [...arr],
        indices: [],
        action: 'divide',
        description: `📊 Dividing: [${leftArr.join(', ')}] and [${rightArr.join(', ')}]`,
      });

      let i = 0, j = 0, k = left;

      while (i < leftArr.length && j < rightArr.length) {
        steps.push({
          type: 'array',
          data: [...arr],
          indices: [left + i, mid + 1 + j],
          action: 'compare',
          description: `🔍 Comparing ${leftArr[i]} and ${rightArr[j]}`,
        });

        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i];
          i++;
        } else {
          arr[k] = rightArr[j];
          j++;
        }
        k++;

        steps.push({
          type: 'array',
          data: [...arr],
          indices: [k - 1],
          action: 'merge',
          description: `🔄 Merged ${arr[k - 1]} into position ${k - 1}`,
        });
      }

      while (i < leftArr.length) {
        arr[k] = leftArr[i];
        steps.push({
          type: 'array',
          data: [...arr],
          indices: [k],
          action: 'merge',
          description: `➡️ Copying remaining ${leftArr[i]}`,
        });
        i++;
        k++;
      }

      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        steps.push({
          type: 'array',
          data: [...arr],
          indices: [k],
          action: 'merge',
          description: `➡️ Copying remaining ${rightArr[j]}`,
        });
        j++;
        k++;
      }
    };

    const mergeSortRecursive = (arr: number[], left: number, right: number) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        mergeSortRecursive(arr, left, mid);
        mergeSortRecursive(arr, mid + 1, right);
        merge(arr, left, mid, right);
      }
    };

    mergeSortRecursive(arr, 0, arr.length - 1);

    steps.push({
      type: 'array',
      data: [...arr],
      indices: [],
      action: 'complete',
      description: '🎉 Array is now sorted!',
    });

    return steps;
  };

  const generateQuickSortSteps = (arr: number[]): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    
    steps.push({
      type: 'array',
      data: [...arr],
      indices: [],
      action: 'init',
      description: '🚀 Starting Quick Sort: Partitioning around pivot',
    });

    const partition = (arr: number[], low: number, high: number): number => {
      const pivot = arr[high];
      
      steps.push({
        type: 'array',
        data: [...arr],
        indices: [high],
        action: 'pivot',
        description: `🎯 Selecting pivot: ${pivot} at index ${high}`,
      });

      let i = low - 1;

      for (let j = low; j < high; j++) {
        steps.push({
          type: 'array',
          data: [...arr],
          indices: [j, high],
          action: 'compare',
          description: `🔍 Comparing arr[${j}] = ${arr[j]} with pivot = ${pivot}`,
        });

        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({
            type: 'array',
            data: [...arr],
            indices: [i, j],
            action: 'swap',
            description: `🔄 Swapping ${arr[j]} and ${arr[i]}`,
          });
        }
      }

      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      steps.push({
        type: 'array',
        data: [...arr],
        indices: [i + 1],
        action: 'pivotpos',
        description: `✅ Pivot ${pivot} placed at final position ${i + 1}`,
      });

      return i + 1;
    };

    const quickSortRecursive = (arr: number[], low: number, high: number) => {
      if (low < high) {
        const pi = partition(arr, low, high);
        quickSortRecursive(arr, low, pi - 1);
        quickSortRecursive(arr, pi + 1, high);
      }
    };

    quickSortRecursive(arr, 0, arr.length - 1);

    steps.push({
      type: 'array',
      data: [...arr],
      indices: [],
      action: 'complete',
      description: '🎉 Array is now sorted!',
    });

    return steps;
  };

  const generateHeapSortSteps = (arr: number[]): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const n = arr.length;

    steps.push({
      type: 'array',
      data: [...arr],
      indices: [],
      action: 'init',
      description: '🚀 Starting Heap Sort: Building max heap',
    });

    const heapify = (arr: number[], n: number, i: number) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < n && arr[left] > arr[largest]) {
        largest = left;
      }

      if (right < n && arr[right] > arr[largest]) {
        largest = right;
      }

      if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        steps.push({
          type: 'array',
          data: [...arr],
          indices: [i, largest],
          action: 'swap',
          description: `🔄 Heapifying: Swapping ${arr[largest]} and ${arr[i]}`,
        });
        heapify(arr, n, largest);
      }
    };

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(arr, n, i);
    }

    for (let i = n - 1; i > 0; i--) {
      [arr[0], arr[i]] = [arr[i], arr[0]];
      steps.push({
        type: 'array',
        data: [...arr],
        indices: [0, i],
        action: 'swap',
        description: `🔄 Swapping root ${arr[i]} with last element`,
      });
      heapify(arr, i, 0);
    }

    steps.push({
      type: 'array',
      data: [...arr],
      indices: [],
      action: 'complete',
      description: '🎉 Array is now sorted!',
    });

    return steps;
  };

  // ========== GRAPH ALGORITHMS ==========
  const generateBFSSteps = (): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const nodes = [
      { id: 'A', label: 'A', x: 100, y: 100 },
      { id: 'B', label: 'B', x: 200, y: 50 },
      { id: 'C', label: 'C', x: 200, y: 150 },
      { id: 'D', label: 'D', x: 300, y: 100 },
      { id: 'E', label: 'E', x: 400, y: 50 },
      { id: 'F', label: 'F', x: 400, y: 150 },
    ];
    const edges = [
      { source: 'A', target: 'B' },
      { source: 'A', target: 'C' },
      { source: 'B', target: 'D' },
      { source: 'C', target: 'D' },
      { source: 'D', target: 'E' },
      { source: 'D', target: 'F' },
    ];

    const adjList: Record<string, string[]> = {};
    nodes.forEach(node => { adjList[node.id] = []; });
    edges.forEach(edge => {
      adjList[edge.source].push(edge.target);
      adjList[edge.target].push(edge.source);
    });

    steps.push({
      type: 'graph',
      graphState: {
        nodes: [...nodes],
        edges: [...edges],
        visited: [],
        queue: ['A'],
        current: null,
      },
      action: 'init',
      description: '🚀 Starting BFS from node A',
    });

    const visited = new Set<string>();
    const queue: string[] = ['A'];
    visited.add('A');

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      steps.push({
        type: 'graph',
        graphState: {
          nodes: [...nodes],
          edges: [...edges],
          visited: Array.from(visited),
          queue: [...queue],
          current: current,
        },
        action: 'visit',
        description: `📍 Visiting node ${current}`,
      });

      adjList[current].forEach(neighbor => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          
          steps.push({
            type: 'graph',
            graphState: {
              nodes: [...nodes],
              edges: [...edges],
              visited: Array.from(visited),
              queue: [...queue],
              current: current,
            },
            action: 'enqueue',
            description: `➕ Adding ${neighbor} to queue`,
          });
        }
      });
    }

    steps.push({
      type: 'graph',
      graphState: {
        nodes: [...nodes],
        edges: [...edges],
        visited: Array.from(visited),
        queue: [],
        current: null,
      },
      action: 'complete',
      description: '🎉 BFS traversal complete!',
    });

    return steps;
  };

  const generateDFSSteps = (): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const nodes = [
      { id: 'A', label: 'A', x: 100, y: 100 },
      { id: 'B', label: 'B', x: 200, y: 50 },
      { id: 'C', label: 'C', x: 200, y: 150 },
      { id: 'D', label: 'D', x: 300, y: 100 },
      { id: 'E', label: 'E', x: 400, y: 50 },
      { id: 'F', label: 'F', x: 400, y: 150 },
    ];
    const edges = [
      { source: 'A', target: 'B' },
      { source: 'A', target: 'C' },
      { source: 'B', target: 'D' },
      { source: 'C', target: 'D' },
      { source: 'D', target: 'E' },
      { source: 'D', target: 'F' },
    ];

    const adjList: Record<string, string[]> = {};
    nodes.forEach(node => { adjList[node.id] = []; });
    edges.forEach(edge => {
      adjList[edge.source].push(edge.target);
      adjList[edge.target].push(edge.source);
    });

    steps.push({
      type: 'graph',
      graphState: {
        nodes: [...nodes],
        edges: [...edges],
        visited: [],
        queue: [],
        current: null,
      },
      action: 'init',
      description: '🚀 Starting DFS from node A',
    });

    const visited = new Set<string>();
    const stack: string[] = ['A'];

    const dfs = (node: string) => {
      if (visited.has(node)) return;
      
      visited.add(node);
      stack.pop();
      
      steps.push({
        type: 'graph',
        graphState: {
          nodes: [...nodes],
          edges: [...edges],
          visited: Array.from(visited),
          queue: [...stack],
          current: node,
        },
        action: 'visit',
        description: `📍 Visiting node ${node}`,
      });

      adjList[node].forEach(neighbor => {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
          
          steps.push({
            type: 'graph',
            graphState: {
              nodes: [...nodes],
              edges: [...edges],
              visited: Array.from(visited),
              queue: [...stack],
              current: node,
            },
            action: 'push',
            description: `📥 Pushing ${neighbor} to stack`,
          });
          
          dfs(neighbor);
        }
      });
    };

    dfs('A');

    steps.push({
      type: 'graph',
      graphState: {
        nodes: [...nodes],
        edges: [...edges],
        visited: Array.from(visited),
        queue: [],
        current: null,
      },
      action: 'complete',
      description: '🎉 DFS traversal complete!',
    });

    return steps;
  };

  const generateDijkstraSteps = (): AlgorithmStep[] => {
    // Simplified Dijkstra visualization
    return generateBFSSteps().map(step => ({
      ...step,
      description: step.description.replace('BFS', 'Dijkstra'),
    }));
  };

  // ========== RECURSION ==========
  const generateRecursionSteps = (): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const n = 5; // Factorial of 5

    steps.push({
      type: 'recursion',
      recursionStack: [],
      action: 'init',
      description: `🚀 Calculating factorial(${n}) using recursion`,
    });

    const calculateFactorial = (num: number, depth: number, stack: Array<{ function: string; params: any; returnValue?: any; depth: number }>): AlgorithmStep[] => {
      const stepStack = [...stack];
      stepStack.push({
        function: 'factorial',
        params: num,
        depth: depth,
      });

      steps.push({
        type: 'recursion',
        recursionStack: [...stepStack],
        action: 'call',
        description: `📞 Calling factorial(${num}) - Stack depth: ${depth}`,
      });

      if (num <= 1) {
        stepStack[stepStack.length - 1].returnValue = 1;
        steps.push({
          type: 'recursion',
          recursionStack: [...stepStack],
          action: 'return',
          description: `✅ Base case: factorial(${num}) = 1`,
        });
        stepStack.pop();
        return steps;
      }

      const subSteps = calculateFactorial(num - 1, depth + 1, stepStack);
      steps.push(...subSteps);

      const result = (stepStack[stepStack.length - 1]?.returnValue || 1) * num;
      stepStack[stepStack.length - 1].returnValue = result;
      
      steps.push({
        type: 'recursion',
        recursionStack: [...stepStack],
        action: 'return',
        description: `✅ Returning: factorial(${num}) = ${num} × factorial(${num - 1}) = ${result}`,
      });

      stepStack.pop();
      return steps;
    };

    calculateFactorial(n, 0, []);

    steps.push({
      type: 'recursion',
      recursionStack: [],
      action: 'complete',
      description: `🎉 Recursion complete! Result: ${n}! = ${factorial(n)}`,
    });

    return steps;
  };

  const factorial = (n: number): number => {
    return n <= 1 ? 1 : n * factorial(n - 1);
  };

  // ========== TREE TRAVERSAL ==========
  const generateTreeTraversalSteps = (slug: string): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const root = {
      value: 10,
      left: {
        value: 5,
        left: { value: 3, left: null, right: null },
        right: { value: 7, left: null, right: null },
      },
      right: {
        value: 15,
        left: { value: 12, left: null, right: null },
        right: { value: 20, left: null, right: null },
      },
    };

    const traversalType = slug.includes('preorder') ? 'preorder' : 
                          slug.includes('inorder') ? 'inorder' : 
                          slug.includes('postorder') ? 'postorder' : 'inorder';

    steps.push({
      type: 'tree',
      treeState: {
        root: root,
        visited: [],
        current: null,
      },
      action: 'init',
      description: `🚀 Starting ${traversalType} traversal`,
    });

    const visited: number[] = [];
    
    const traverse = (node: any, type: string) => {
      if (!node) return;

      if (type === 'preorder') {
        visited.push(node.value);
        steps.push({
          type: 'tree',
          treeState: {
            root: root,
            visited: [...visited],
            current: node.value,
          },
          action: 'visit',
          description: `📍 Visiting ${node.value} (Preorder: Root → Left → Right)`,
        });
        traverse(node.left, type);
        traverse(node.right, type);
      } else if (type === 'inorder') {
        traverse(node.left, type);
        visited.push(node.value);
        steps.push({
          type: 'tree',
          treeState: {
            root: root,
            visited: [...visited],
            current: node.value,
          },
          action: 'visit',
          description: `📍 Visiting ${node.value} (Inorder: Left → Root → Right)`,
        });
        traverse(node.right, type);
      } else {
        traverse(node.left, type);
        traverse(node.right, type);
        visited.push(node.value);
        steps.push({
          type: 'tree',
          treeState: {
            root: root,
            visited: [...visited],
            current: node.value,
          },
          action: 'visit',
          description: `📍 Visiting ${node.value} (Postorder: Left → Right → Root)`,
        });
      }
    };

    traverse(root, traversalType);

    steps.push({
      type: 'tree',
      treeState: {
        root: root,
        visited: [...visited],
        current: null,
      },
      action: 'complete',
      description: `🎉 Traversal complete! Order: [${visited.join(', ')}]`,
    });

    return steps;
  };

  // ========== TREE INSERTION ==========
  const generateTreeInsertionSteps = (): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    
    // Initial tree
    let root: any = {
      value: 10,
      left: {
        value: 5,
        left: { value: 3, left: null, right: null },
        right: { value: 7, left: null, right: null },
      },
      right: {
        value: 15,
        left: { value: 12, left: null, right: null },
        right: { value: 20, left: null, right: null },
      },
    };

    const valueToInsert = 13;
    
    steps.push({
      type: 'tree',
      treeState: {
        root: JSON.parse(JSON.stringify(root)),
        visited: [],
        current: null,
      },
      action: 'init',
      description: `🚀 Starting BST Insertion: Inserting value ${valueToInsert}`,
    });

    const insertNode = (node: any, val: number, path: number[]): any => {
      if (!node) {
        const newNode = { value: val, left: null, right: null };
        
        steps.push({
          type: 'tree',
          treeState: {
            root: JSON.parse(JSON.stringify(root)),
            visited: [...path],
            current: val,
          },
          action: 'insert',
          description: `✨ Creating new node with value ${val}`,
        });
        return newNode;
      }

      steps.push({
        type: 'tree',
        treeState: {
          root: JSON.parse(JSON.stringify(root)),
          visited: [...path, node.value],
          current: node.value,
        },
        action: 'compare',
        description: `🔍 Comparing ${val} with current node ${node.value}`,
      });

      if (val < node.value) {
        steps.push({
          type: 'tree',
          treeState: {
            root: JSON.parse(JSON.stringify(root)),
            visited: [...path, node.value],
            current: node.value,
          },
          action: 'traverse',
          description: `⬅️ ${val} < ${node.value}, going to left subtree`,
        });
        node.left = insertNode(node.left, val, [...path, node.value]);
        // Show tree after insertion
        steps.push({
          type: 'tree',
          treeState: {
            root: JSON.parse(JSON.stringify(root)),
            visited: [...path, node.value, val],
            current: val,
          },
          action: 'inserted',
          description: `✨ Node ${val} inserted in left subtree`,
        });
      } else if (val > node.value) {
        steps.push({
          type: 'tree',
          treeState: {
            root: JSON.parse(JSON.stringify(root)),
            visited: [...path, node.value],
            current: node.value,
          },
          action: 'traverse',
          description: `➡️ ${val} > ${node.value}, going to right subtree`,
        });
        node.right = insertNode(node.right, val, [...path, node.value]);
        // Show tree after insertion
        steps.push({
          type: 'tree',
          treeState: {
            root: JSON.parse(JSON.stringify(root)),
            visited: [...path, node.value, val],
            current: val,
          },
          action: 'inserted',
          description: `✨ Node ${val} inserted in right subtree`,
        });
      } else {
        steps.push({
          type: 'tree',
          treeState: {
            root: JSON.parse(JSON.stringify(root)),
            visited: [...path, node.value],
            current: node.value,
          },
          action: 'duplicate',
          description: `⚠️ Value ${val} already exists in tree`,
        });
      }

      return node;
    };

    root = insertNode(root, valueToInsert, []);

    // Show final tree with inserted node highlighted
    const getAllValues = (node: any): number[] => {
      if (!node) return [];
      return [node.value, ...getAllValues(node.left), ...getAllValues(node.right)];
    };
    
    steps.push({
      type: 'tree',
      treeState: {
        root: JSON.parse(JSON.stringify(root)),
        visited: [valueToInsert],
        current: valueToInsert,
      },
      action: 'complete',
      description: `🎉 Insertion complete! Value ${valueToInsert} inserted into BST`,
    });

    return steps;
  };

  // ========== TREE DELETION ==========
  const generateTreeDeletionSteps = (): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    
    // Initial tree
    let root: any = {
      value: 10,
      left: {
        value: 5,
        left: { value: 3, left: null, right: null },
        right: { value: 7, left: null, right: null },
      },
      right: {
        value: 15,
        left: { value: 12, left: null, right: null },
        right: { value: 20, left: null, right: null },
      },
    };

    const valueToDelete = 7;
    
    steps.push({
      type: 'tree',
      treeState: {
        root: JSON.parse(JSON.stringify(root)),
        visited: [],
        current: null,
      },
      action: 'init',
      description: `🚀 Starting BST Deletion: Deleting value ${valueToDelete}`,
    });

    const findMin = (node: any): any => {
      while (node.left) {
        node = node.left;
      }
      return node;
    };

    const deleteNode = (node: any, val: number, path: number[]): any => {
      if (!node) {
        steps.push({
          type: 'tree',
          treeState: {
            root: JSON.parse(JSON.stringify(root)),
            visited: [...path],
            current: null,
          },
          action: 'notfound',
          description: `❌ Value ${val} not found in tree`,
        });
        return null;
      }

      steps.push({
        type: 'tree',
        treeState: {
          root: JSON.parse(JSON.stringify(root)),
          visited: [...path, node.value],
          current: node.value,
        },
        action: 'compare',
        description: `🔍 Comparing ${val} with current node ${node.value}`,
      });

      if (val < node.value) {
        steps.push({
          type: 'tree',
          treeState: {
            root: JSON.parse(JSON.stringify(root)),
            visited: [...path, node.value],
            current: node.value,
          },
          action: 'traverse',
          description: `⬅️ ${val} < ${node.value}, searching in left subtree`,
        });
        node.left = deleteNode(node.left, val, [...path, node.value]);
      } else if (val > node.value) {
        steps.push({
          type: 'tree',
          treeState: {
            root: JSON.parse(JSON.stringify(root)),
            visited: [...path, node.value],
            current: node.value,
          },
          action: 'traverse',
          description: `➡️ ${val} > ${node.value}, searching in right subtree`,
        });
        node.right = deleteNode(node.right, val, [...path, node.value]);
      } else {
        // Node found, delete it
        steps.push({
          type: 'tree',
          treeState: {
            root: JSON.parse(JSON.stringify(root)),
            visited: [...path, node.value],
            current: node.value,
          },
          action: 'found',
          description: `✅ Found node ${val} to delete`,
        });

        // Case 1: No children
        if (!node.left && !node.right) {
          steps.push({
            type: 'tree',
            treeState: {
              root: JSON.parse(JSON.stringify(root)),
              visited: [...path, node.value],
              current: node.value,
            },
            action: 'delete',
            description: `🗑️ Node ${val} has no children, deleting directly`,
          });
          const result = null;
          // Update root after deletion
          if (path.length === 0) {
            root = result;
          }
          return result;
        }
        // Case 2: One child
        else if (!node.left) {
          steps.push({
            type: 'tree',
            treeState: {
              root: JSON.parse(JSON.stringify(root)),
              visited: [...path, node.value],
              current: node.value,
            },
            action: 'delete',
            description: `🔄 Node ${val} has only right child, replacing with right child`,
          });
          const result = node.right;
          // Update root after deletion
          if (path.length === 0) {
            root = result;
          }
          return result;
        } else if (!node.right) {
          steps.push({
            type: 'tree',
            treeState: {
              root: JSON.parse(JSON.stringify(root)),
              visited: [...path, node.value],
              current: node.value,
            },
            action: 'delete',
            description: `🔄 Node ${val} has only left child, replacing with left child`,
          });
          const result = node.left;
          // Update root after deletion
          if (path.length === 0) {
            root = result;
          }
          return result;
        }
        // Case 3: Two children
        else {
          const minNode = findMin(node.right);
          steps.push({
            type: 'tree',
            treeState: {
              root: JSON.parse(JSON.stringify(root)),
              visited: [...path, node.value],
              current: node.value,
            },
            action: 'findmin',
            description: `🔍 Node ${val} has two children, finding inorder successor: ${minNode.value}`,
          });
          
          node.value = minNode.value;
          steps.push({
            type: 'tree',
            treeState: {
              root: JSON.parse(JSON.stringify(root)),
              visited: [...path, node.value],
              current: node.value,
            },
            action: 'replace',
            description: `🔄 Replacing ${val} with inorder successor ${minNode.value}`,
          });
          
          node.right = deleteNode(node.right, minNode.value, [...path, node.value]);
          // Update root after deletion
          if (path.length === 0) {
            root = node;
          }
        }
      }

      return node;
    };

    const finalRoot = deleteNode(root, valueToDelete, []);
    root = finalRoot || root;

    steps.push({
      type: 'tree',
      treeState: {
        root: JSON.parse(JSON.stringify(root)),
        visited: [],
        current: null,
      },
      action: 'complete',
      description: `🎉 Deletion complete! Value ${valueToDelete} removed from BST`,
    });

    return steps;
  };

  // ========== GRAPH INSERTION ==========
  const generateGraphInsertionSteps = (): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    
    // Initial graph
    let nodes = [
      { id: 'A', label: 'A', x: 100, y: 100 },
      { id: 'B', label: 'B', x: 200, y: 100 },
      { id: 'C', label: 'C', x: 150, y: 200 },
    ];
    let edges = [
      { source: 'A', target: 'B' },
    ];

    const newNodeId = 'D';
    const newNodeLabel = 'D';
    const connectToNode = 'B';

    steps.push({
      type: 'graph',
      graphState: {
        nodes: [...nodes],
        edges: [...edges],
        visited: [],
        queue: [],
        current: null,
      },
      action: 'init',
      description: `🚀 Starting Graph Insertion: Adding node ${newNodeLabel} and connecting to ${connectToNode}`,
    });

    // Add new node
    nodes.push({
      id: newNodeId,
      label: newNodeLabel,
      x: 300,
      y: 100,
    });

    steps.push({
      type: 'graph',
      graphState: {
        nodes: [...nodes],
        edges: [...edges],
        visited: [newNodeId],
        queue: [],
        current: newNodeId,
      },
      action: 'addnode',
      description: `➕ Adding new node ${newNodeLabel} to graph`,
    });

    // Add edge
    edges.push({
      source: connectToNode,
      target: newNodeId,
    });

    steps.push({
      type: 'graph',
      graphState: {
        nodes: [...nodes],
        edges: [...edges],
        visited: [connectToNode, newNodeId],
        queue: [],
        current: newNodeId,
      },
      action: 'addedge',
      description: `🔗 Connecting ${connectToNode} to ${newNodeLabel}`,
    });

    steps.push({
      type: 'graph',
      graphState: {
        nodes: [...nodes],
        edges: [...edges],
        visited: [],
        queue: [],
        current: null,
      },
      action: 'complete',
      description: `🎉 Graph insertion complete! Node ${newNodeLabel} added and connected`,
    });

    return steps;
  };

  // ========== GRAPH DELETION ==========
  const generateGraphDeletionSteps = (): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    
    // Initial graph
    let nodes = [
      { id: 'A', label: 'A', x: 100, y: 100 },
      { id: 'B', label: 'B', x: 200, y: 100 },
      { id: 'C', label: 'C', x: 150, y: 200 },
      { id: 'D', label: 'D', x: 300, y: 100 },
    ];
    let edges = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
      { source: 'B', target: 'D' },
      { source: 'C', target: 'D' },
    ];

    const nodeToDelete = 'D';

    steps.push({
      type: 'graph',
      graphState: {
        nodes: [...nodes],
        edges: [...edges],
        visited: [],
        queue: [],
        current: null,
      },
      action: 'init',
      description: `🚀 Starting Graph Deletion: Removing node ${nodeToDelete} and its edges`,
    });

    // Highlight node to be deleted
    steps.push({
      type: 'graph',
      graphState: {
        nodes: [...nodes],
        edges: [...edges],
        visited: [nodeToDelete],
        queue: [],
        current: nodeToDelete,
      },
      action: 'highlight',
      description: `📍 Identifying node ${nodeToDelete} for deletion`,
    });

    // Remove edges connected to this node
    const edgesToRemove = edges.filter(
      e => e.source === nodeToDelete || e.target === nodeToDelete
    );
    
    if (edgesToRemove.length > 0) {
      edges = edges.filter(
        e => e.source !== nodeToDelete && e.target !== nodeToDelete
      );
      
      steps.push({
        type: 'graph',
        graphState: {
          nodes: [...nodes],
          edges: [...edges],
          visited: [nodeToDelete],
          queue: [],
          current: nodeToDelete,
        },
        action: 'removeedges',
        description: `🔗 Removing ${edgesToRemove.length} edge(s) connected to ${nodeToDelete}`,
      });
    }

    // Remove node
    nodes = nodes.filter(n => n.id !== nodeToDelete);

    steps.push({
      type: 'graph',
      graphState: {
        nodes: [...nodes],
        edges: [...edges],
        visited: [],
        queue: [],
        current: null,
      },
      action: 'deletenode',
      description: `🗑️ Removing node ${nodeToDelete} from graph`,
    });

    steps.push({
      type: 'graph',
      graphState: {
        nodes: [...nodes],
        edges: [...edges],
        visited: [],
        queue: [],
        current: null,
      },
      action: 'complete',
      description: `🎉 Graph deletion complete! Node ${nodeToDelete} and its edges removed`,
    });

    return steps;
  };

  // ========== ARRAY OPERATIONS ==========
  const generateArrayOperationSteps = (arr: number[]): AlgorithmStep[] => {
    return [
      {
        type: 'array',
        data: [...arr],
        indices: [],
        action: 'display',
        description: '📊 Array visualization - Elements stored in contiguous memory',
      },
    ];
  };

  const generateDefaultSteps = (arr: number[], slug: string, title: string): AlgorithmStep[] => {
    // Try to detect what kind of algorithm
    if (slug.includes('sort')) {
      return generateBubbleSortSteps(arr);
    }
    return generateArrayOperationSteps(arr);
  };

  // Update current description and data when step changes
  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      setCurrentDescription(step.description);
      if (step.data) {
        setData(step.data);
      }
      if (step.type) {
        setVisualizationType(step.type);
      }
    }
  }, [currentStep, steps]);

  // Auto-play animation
  useEffect(() => {
    if (isPlaying && steps.length > 0 && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 1000 / animationSpeed);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length, animationSpeed]);

  const handlePlay = () => {
    if (steps.length === 0) {
      const newSteps = generateSteps();
      setSteps(newSteps);
      setCurrentStep(0);
      setCurrentDescription(newSteps[0]?.description || '');
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setData(initialData);
    const newSteps = generateSteps();
    setSteps(newSteps);
    setCurrentStep(0);
    setCurrentDescription(newSteps[0]?.description || '');
  };

  const currentStepData = steps[currentStep] || { 
    type: 'array',
    data: initialData, 
    indices: [], 
    action: 'init', 
    description: 'Ready to visualize algorithm' 
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'init': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700';
      case 'compare': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700';
      case 'swap': return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700';
      case 'visit': return 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700';
      case 'insert': case 'inserted': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700';
      case 'delete': case 'deletenode': return 'bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700';
      case 'traverse': return 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700';
      case 'addnode': case 'addedge': return 'bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700';
      case 'removeedges': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700';
      case 'found': return 'bg-lime-50 dark:bg-lime-900/20 border-lime-300 dark:border-lime-700';
      case 'replace': return 'bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700';
      case 'findmin': return 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700';
      case 'complete': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700';
    }
  };

  return (
    <div className="w-full">
      {/* Beautiful Header with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-4 mb-3 shadow-2xl border border-white/20 dark:border-gray-700/30 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-lg">
              <FaStar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {conceptTitle}
              </h3>
            </div>
          </div>
          <div className="px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/30">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
              {currentStep + 1}/{steps.length || 1}
            </span>
          </div>
        </div>

        {/* Beautiful Description Box */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className={`p-3 rounded-xl border-2 mb-3 ${getActionColor(currentStepData.action)} shadow-lg`}
          >
            <p className="text-xs font-semibold text-gray-900 dark:text-white leading-relaxed">
              {currentDescription || 'Ready to visualize algorithm'}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Beautiful Controls */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl hover:shadow-lg transition-all border border-gray-300 dark:border-gray-600"
            title="Reset"
          >
            <FaRedo className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl hover:shadow-lg transition-all border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous Step"
          >
            <FaStepBackward className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={isPlaying ? handlePause : handlePlay}
            className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all shadow-lg hover:scale-105"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <FaPause className="w-5 h-5" />
            ) : (
              <FaPlay className="w-5 h-5" />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            disabled={currentStep >= steps.length - 1}
            className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl hover:shadow-lg transition-all border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next Step"
          >
            <FaStepForward className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </motion.button>
          
          <div className="ml-auto flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Speed:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
              className="w-24 accent-indigo-600"
            />
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 w-8 text-center">
              {animationSpeed}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Visualization Area */}
      <div className="glass-card rounded-2xl p-4 shadow-xl border border-white/20 dark:border-gray-700/30 overflow-hidden w-full">
        <div className="w-full overflow-x-auto overflow-y-hidden">
          {visualizationType === 'array' && currentStepData.data && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full min-w-0"
            >
              <div className="w-full overflow-x-auto">
                <ArrayVisualizer
                  data={currentStepData.data}
                  highlightIndices={currentStepData.indices || []}
                  showControls={false}
                  enableStepControl={false}
                />
              </div>
            </motion.div>
          )}

        {visualizationType === 'graph' && currentStepData.graphState && (
          <div className="w-full overflow-x-auto overflow-y-hidden">
            <GraphStepVisualizer
              graphState={currentStepData.graphState}
            />
          </div>
        )}

        {visualizationType === 'graph' && !currentStepData.graphState && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-sm">Graph visualization loading...</p>
          </div>
        )}

        {visualizationType === 'tree' && currentStepData.treeState && currentStepData.treeState.root && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full overflow-x-auto overflow-y-hidden"
          >
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800 min-w-[300px]">
              <div className="w-full overflow-x-auto">
                <TreeVisualizer
                  root={currentStepData.treeState.root}
                  onNodeClick={() => {}}
                  highlightNodes={currentStepData.treeState?.visited || []}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentStepData.treeState?.visited && (
                  <div className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-300 dark:border-green-700">
                    <div className="text-xs font-medium text-green-800 dark:text-green-300 mb-0.5">Visited Nodes</div>
                    <div className="text-xs font-bold text-green-900 dark:text-green-200 break-all">
                      {currentStepData.treeState.visited.length > 0 
                        ? `[${currentStepData.treeState.visited.join(', ')}]`
                        : 'None'}
                    </div>
                  </div>
                )}
                {currentStepData.treeState?.current && (
                  <div className="px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <div className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-0.5">Current Node</div>
                    <div className="text-xs font-bold text-yellow-900 dark:text-yellow-200">
                      {currentStepData.treeState.current}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {visualizationType === 'tree' && (!currentStepData.treeState || !currentStepData.treeState.root) && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-sm">Tree visualization loading...</p>
          </div>
        )}

        {visualizationType === 'recursion' && currentStepData.recursionStack && Array.isArray(currentStepData.recursionStack) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full overflow-x-auto overflow-y-hidden"
          >
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800 shadow-xl min-w-[300px]">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
                  <span className="text-xl">📚</span>
                </div>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Recursion Call Stack
                </span>
              </h4>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {currentStepData.recursionStack.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-sm font-medium">Stack is empty</p>
                  </div>
                ) : (
                  currentStepData.recursionStack.map((frame, index) => {
                    const isActive = index === currentStepData.recursionStack!.length - 1;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -30, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white border-purple-300 shadow-2xl scale-[1.02] ring-2 ring-purple-300/50'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white shadow-md hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`font-bold text-lg ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                {frame.function}({frame.params})
                              </div>
                              {isActive && (
                                <span className="px-2 py-1 bg-white/30 rounded-lg text-xs font-bold">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <div className={`text-xs mt-1 ${isActive ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'}`}>
                              Stack Depth: {frame.depth} • Frame #{index + 1}
                            </div>
                          </div>
                          {frame.returnValue !== undefined && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold shadow-lg"
                            >
                              = {frame.returnValue}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
}
