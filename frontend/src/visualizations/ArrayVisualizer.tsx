import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRedo } from 'react-icons/fa';

interface ArrayVisualizerProps {
  data: number[];
  onDataChange?: (newData: number[]) => void;
  highlightIndices?: number[];
  showControls?: boolean;
  enableStepControl?: boolean;
}

export default function ArrayVisualizer({
  data,
  onDataChange,
  highlightIndices = [],
  showControls = true,
  enableStepControl = false,
}: ArrayVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [arraySize, setArraySize] = useState(data.length);
  const [animationSpeed, setAnimationSpeed] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationSteps, setAnimationSteps] = useState<Array<{ indices: number[]; action: string }>>([]);

  // Calculate current highlight based on step control or highlightIndices prop
  const currentHighlight = enableStepControl && animationSteps.length > 0
    ? animationSteps[currentStep]?.indices || []
    : highlightIndices;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Add gradients
    const defs = svg.append('defs');
    
    // Bar gradient
    const barGradient = defs.append('linearGradient')
      .attr('id', 'barGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    barGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#6366f1')
      .attr('stop-opacity', 1);
    barGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8b5cf6')
      .attr('stop-opacity', 1);
    
    // Highlight gradient
    const highlightGradient = defs.append('linearGradient')
      .attr('id', 'highlightGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    highlightGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ef4444')
      .attr('stop-opacity', 1);
    highlightGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f97316')
      .attr('stop-opacity', 1);
    
    // Glow filter for highlighted bars
    const glowFilter = defs.append('filter')
      .attr('id', 'barGlow');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const width = svgRef.current.clientWidth || 800;
    const height = 300;
    const padding = 20;
    const barWidth = (width - padding * 2) / data.length - 5;
    const maxValue = Math.max(...data, 1);

    // Create bars
    svg
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (_, i) => padding + i * (barWidth + 5))
      .attr('y', (d) => height - padding - (d / maxValue) * (height - padding * 2))
      .attr('width', barWidth)
      .attr('height', (d) => (d / maxValue) * (height - padding * 2))
      .attr('fill', (_, i) => {
        if (currentHighlight.includes(i)) {
          return 'url(#highlightGradient)';
        }
        return 'url(#barGradient)';
      })
      .attr('rx', 6)
      .attr('filter', (_, i) => currentHighlight.includes(i) ? 'url(#barGlow)' : 'none')
      .attr('stroke', (_, i) => currentHighlight.includes(i) ? '#ef4444' : 'none')
      .attr('stroke-width', (_, i) => currentHighlight.includes(i) ? 2 : 0)
      .transition()
      .duration(300)
      .attr('y', (d) => height - padding - (d / maxValue) * (height - padding * 2))
      .attr('height', (d) => (d / maxValue) * (height - padding * 2));

    // Add labels
    svg
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr('x', (_, i) => padding + i * (barWidth + 5) + barWidth / 2)
      .attr('y', height - padding + 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '15px')
      .attr('font-weight', 'bold')
      .attr('fill', (_, i) => currentHighlight.includes(i) ? '#ef4444' : '#374151')
      .text((d) => d);

    // Add index labels
    svg
      .selectAll('.index-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'index-label')
      .attr('x', (_, i) => padding + i * (barWidth + 5) + barWidth / 2)
      .attr('y', (d, i) => height - padding - (d / maxValue) * (height - padding * 2) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', (_, i) => currentHighlight.includes(i) ? '#ef4444' : '#6b7280')
      .text((_, i) => `[${i}]`);
  }, [data, currentHighlight]);

  const generateRandomArray = () => {
    const newArray = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 100) + 1
    );
    onDataChange?.(newArray);
  };

  const shuffleArray = () => {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    onDataChange?.(shuffled);
  };

  const generateBubbleSortSteps = () => {
    const arr = [...data];
    const steps: Array<{ indices: number[]; action: string }> = [];
    const n = arr.length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({ indices: [j, j + 1], action: 'compare' });
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({ indices: [j, j + 1], action: 'swap' });
        }
      }
    }
    return steps;
  };

  const startStepAnimation = () => {
    if (animationSteps.length === 0) {
      const steps = generateBubbleSortSteps();
      setAnimationSteps(steps);
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  const nextStep = () => {
    if (currentStep < animationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setAnimationSteps([]);
  };

  // Auto-play animation
  useEffect(() => {
    if (isPlaying && animationSteps.length > 0 && currentStep < animationSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 1000 / animationSpeed);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep >= animationSteps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, animationSteps.length, animationSpeed]);

  return (
    <div className="w-full glass-card p-4 overflow-hidden">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Array Visualization</h3>
        {showControls && (
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Array Size: {arraySize}
              </label>
              <input
                type="range"
                min="3"
                max="20"
                value={arraySize}
                onChange={(e) => {
                  const newSize = parseInt(e.target.value);
                  setArraySize(newSize);
                  const newArray = Array.from({ length: newSize }, () =>
                    Math.floor(Math.random() * 100) + 1
                  );
                  onDataChange?.(newArray);
                }}
                className="w-32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speed: {animationSpeed}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                className="w-32"
              />
            </div>
            <button
              onClick={generateRandomArray}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Generate Random
            </button>
            <button
              onClick={shuffleArray}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Shuffle
            </button>
          </div>
        )}

        {/* Step-by-step Controls */}
        {enableStepControl && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetAnimation}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <FaRedo className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={previousStep}
                disabled={currentStep === 0}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <FaStepBackward className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isPlaying ? pauseAnimation : startStepAnimation}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {isPlaying ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
                disabled={currentStep >= animationSteps.length - 1}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <FaStepForward className="w-4 h-4" />
              </motion.button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Step {currentStep + 1} / {animationSteps.length || 1}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {animationSteps[currentStep]?.action || 'Ready'}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          ref={svgRef}
          width="100%"
          height="300"
          viewBox="0 0 800 300"
          preserveAspectRatio="xMidYMid meet"
          className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
          style={{ maxWidth: '100%', height: 'auto', minWidth: '300px' }}
        />
      </div>
    </div>
  );
}

