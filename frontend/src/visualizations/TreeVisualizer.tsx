import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
}

interface TreeVisualizerProps {
  root?: TreeNode;
  onNodeClick?: (node: TreeNode) => void;
  highlightNodes?: number[];
}

export default function TreeVisualizer({
  root,
  onNodeClick,
  highlightNodes = [],
}: TreeVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [treeData, setTreeData] = useState<TreeNode | null>(
    root ||
      ({
        value: 10,
        left: { value: 5, left: { value: 3 }, right: { value: 7 } },
        right: { value: 15, left: { value: 12 }, right: { value: 20 } },
      } as TreeNode)
  );

  useEffect(() => {
    if (!svgRef.current || !treeData) return;

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
    
    // Highlight gradient
    const highlightGradient = defs.append('linearGradient')
      .attr('id', 'highlightGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    highlightGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ef4444')
      .attr('stop-opacity', 1);
    highlightGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f97316')
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

    const containerWidth = svgRef.current.clientWidth || 800;
    const width = Math.max(containerWidth, 600);
    const height = Math.min(400, Math.max(300, width * 0.5));
    const nodeRadius = Math.min(28, width / 30);
    const horizontalSpacing = Math.min(80, width / 10);
    const verticalSpacing = Math.min(80, height / 5);

    // Calculate tree layout
    const calculateLayout = (node: TreeNode | undefined, x: number, y: number, level: number): any => {
      if (!node) return null;

      const nodeWidth = Math.pow(2, getMaxDepth(node) - level) * horizontalSpacing;
      const leftX = x - nodeWidth / 4;
      const rightX = x + nodeWidth / 4;
      const nextY = y + verticalSpacing;

      return {
        node,
        x,
        y,
        children: [
          calculateLayout(node.left, leftX, nextY, level + 1),
          calculateLayout(node.right, rightX, nextY, level + 1),
        ].filter(Boolean),
      };
    };

    const getMaxDepth = (node: TreeNode | undefined): number => {
      if (!node) return 0;
      return 1 + Math.max(getMaxDepth(node.left), getMaxDepth(node.right));
    };

    const layout = calculateLayout(treeData, width / 2, 50, 0);

    // Draw edges
    const drawEdges = (layoutNode: any) => {
      if (!layoutNode || !layoutNode.children) return;

      layoutNode.children.forEach((child: any) => {
        svg
          .append('line')
          .attr('x1', layoutNode.x)
          .attr('y1', layoutNode.y)
          .attr('x2', child.x)
          .attr('y2', child.y)
          .attr('stroke', '#6366f1')
          .attr('stroke-width', 2.5)
          .attr('opacity', 0.6)
          .attr('stroke-linecap', 'round');

        drawEdges(child);
      });
    };

    // Draw nodes
    const drawNodes = (layoutNode: any) => {
      if (!layoutNode) return;

      const isHighlighted = highlightNodes.includes(layoutNode.node.value);

      const nodeGroup = svg
        .append('g')
        .attr('transform', `translate(${layoutNode.x},${layoutNode.y})`)
        .style('cursor', 'pointer')
        .on('click', () => {
          onNodeClick?.(layoutNode.node);
        });

      nodeGroup
        .append('circle')
        .attr('r', nodeRadius)
        .attr('fill', isHighlighted 
          ? 'url(#highlightGradient)' 
          : 'url(#nodeGradient)')
        .attr('stroke', isHighlighted ? '#ef4444' : '#6366f1')
        .attr('stroke-width', isHighlighted ? 3 : 2)
        .attr('filter', isHighlighted ? 'url(#glow)' : 'none');

      nodeGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('text-shadow', '0 1px 2px rgba(0,0,0,0.3)')
        .text(layoutNode.node.value);

      layoutNode.children?.forEach(drawNodes);
    };

    drawEdges(layout);
    drawNodes(layout);
  }, [treeData, highlightNodes, onNodeClick]);

  const insertNode = (value: number) => {
    const insert = (node: TreeNode | undefined, val: number): TreeNode => {
      if (!node) return { value: val };
      if (val < node.value) {
        return { ...node, left: insert(node.left, val) };
      } else {
        return { ...node, right: insert(node.right, val) };
      }
    };

    setTreeData(insert(treeData, value));
  };

  const generateRandomTree = () => {
    const values = Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 1);
    let newTree: TreeNode | null = null;

    values.forEach((val) => {
      if (!newTree) {
        newTree = { value: val };
      } else {
        const insert = (node: TreeNode, val: number): TreeNode => {
          if (val < node.value) {
            return { ...node, left: node.left ? insert(node.left, val) : { value: val } };
          } else {
            return { ...node, right: node.right ? insert(node.right, val) : { value: val } };
          }
        };
        newTree = insert(newTree, val);
      }
    });

    setTreeData(newTree);
  };

  return (
    <div className="w-full glass-card p-6 rounded-xl overflow-hidden">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-4 gradient-text">Binary Tree Visualization</h3>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="number"
            placeholder="Enter value"
            id="tree-value-input"
            className="px-4 py-2 glass-card border border-indigo-200 dark:border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const input = e.currentTarget;
                const value = parseInt(input.value);
                if (!isNaN(value)) {
                  insertNode(value);
                  input.value = '';
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.getElementById('tree-value-input') as HTMLInputElement;
              const value = parseInt(input?.value || '0');
              if (!isNaN(value)) {
                insertNode(value);
                input.value = '';
              }
            }}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Insert Node
          </button>
          <button
            onClick={generateRandomTree}
            className="px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Generate Random Tree
          </button>
        </div>
      </div>
      <div className="w-full overflow-x-auto rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border border-indigo-200/50 dark:border-indigo-800/50">
        <svg
          ref={svgRef}
          width="100%"
          height="400"
          viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMid meet"
          className="rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm min-w-[600px]"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
}

