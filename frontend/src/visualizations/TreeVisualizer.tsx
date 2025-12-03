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
  showDelete?: boolean;
  showSearch?: boolean;
}

export default function TreeVisualizer({
  root,
  onNodeClick,
  highlightNodes = [],
  showDelete = false,
  showSearch = false,
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
  const [operation, setOperation] = useState<'add' | 'delete' | 'search' | 'traverse'>('add');
  const [algorithm, setAlgorithm] = useState<'inorder' | 'preorder' | 'postorder' | 'bfs'>('inorder');
  const [inputValue, setInputValue] = useState<string>('');
  const [operationResult, setOperationResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [internalHighlightNodes, setInternalHighlightNodes] = useState<number[]>([]);

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
    const height = 500;
    const nodeRadius = 25;
    
    const getMaxDepth = (node: TreeNode | undefined): number => {
      if (!node) return 0;
      return 1 + Math.max(getMaxDepth(node.left), getMaxDepth(node.right));
    };

    const maxDepth = getMaxDepth(treeData);
    const maxNodesAtBottom = Math.pow(2, maxDepth - 1);
    
    // Calculate spacing to fit within bounds
    const horizontalSpacing = Math.max(60, Math.min(120, (width - 100) / maxNodesAtBottom));
    const verticalSpacing = Math.max(70, Math.min(100, (height - 100) / maxDepth));

    // Calculate tree layout with bounds checking
    const calculateLayout = (node: TreeNode | undefined, x: number, y: number, level: number, minX: number, maxX: number): any => {
      if (!node) return null;

      // Ensure x is within bounds
      const clampedX = Math.max(minX + nodeRadius, Math.min(maxX - nodeRadius, x));
      
      // Calculate child positions with proper spacing
      const availableWidth = maxX - minX;
      const childSpacing = availableWidth / 3;
      const leftX = clampedX - childSpacing;
      const rightX = clampedX + childSpacing;
      const nextY = y + verticalSpacing;

      // Ensure children don't go out of bounds
      const leftMinX = minX;
      const leftMaxX = clampedX;
      const rightMinX = clampedX;
      const rightMaxX = maxX;

      return {
        node,
        x: clampedX,
        y,
        children: [
          calculateLayout(node.left, leftX, nextY, level + 1, leftMinX, leftMaxX),
          calculateLayout(node.right, rightX, nextY, level + 1, rightMinX, rightMaxX),
        ].filter(Boolean),
      };
    };

    // Calculate all node positions first to find min/max
    const tempLayout = calculateLayout(treeData, width / 2, 50, 0, 50, width - 50);
    
    // Find actual bounds
    const findBounds = (layoutNode: any): { minX: number; maxX: number; minY: number; maxY: number } => {
      if (!layoutNode) return { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
      
      let bounds = {
        minX: layoutNode.x,
        maxX: layoutNode.x,
        minY: layoutNode.y,
        maxY: layoutNode.y,
      };
      
      layoutNode.children?.forEach((child: any) => {
        const childBounds = findBounds(child);
        bounds.minX = Math.min(bounds.minX, childBounds.minX);
        bounds.maxX = Math.max(bounds.maxX, childBounds.maxX);
        bounds.minY = Math.min(bounds.minY, childBounds.minY);
        bounds.maxY = Math.max(bounds.maxY, childBounds.maxY);
      });
      
      return bounds;
    };
    
    const bounds = findBounds(tempLayout);
    const actualWidth = Math.max(width, bounds.maxX - bounds.minX + 100);
    const actualHeight = Math.max(height, bounds.maxY - bounds.minY + 100);
    
    // Recalculate with proper centering
    const centerX = actualWidth / 2;
    const offsetX = centerX - (bounds.minX + bounds.maxX) / 2;
    
    const adjustLayout = (layoutNode: any): any => {
      if (!layoutNode) return null;
      return {
        ...layoutNode,
        x: layoutNode.x + offsetX,
        children: layoutNode.children?.map(adjustLayout).filter(Boolean) || [],
      };
    };
    
    const layout = adjustLayout(tempLayout);
    
    // Calculate final bounds after adjustment
    const finalBounds = findBounds(layout);

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

      const effectiveHighlightNodes = highlightNodes.length > 0 ? highlightNodes : internalHighlightNodes;
      const isHighlighted = effectiveHighlightNodes.includes(layoutNode.node.value);

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
    
    // Update viewBox to fit the tree
    if (finalBounds && (finalBounds.maxX - finalBounds.minX > 0 || finalBounds.maxY - finalBounds.minY > 0)) {
      const padding = 60;
      const viewBoxX = Math.max(0, finalBounds.minX - padding);
      const viewBoxY = Math.max(0, finalBounds.minY - padding);
      const viewBoxWidth = Math.max(width, finalBounds.maxX - finalBounds.minX + padding * 2);
      const viewBoxHeight = Math.max(height, finalBounds.maxY - finalBounds.minY + padding * 2);
      
      svg.attr('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
    } else {
      svg.attr('viewBox', `0 0 ${width} ${height}`);
    }
  }, [treeData, highlightNodes, onNodeClick, root, internalHighlightNodes]);

  const insertNode = async (value: number) => {
    setOperationResult(null);
    setInternalHighlightNodes([]);

    const path: number[] = [];
    
    const insertAnimated = async (node: TreeNode | null, val: number): Promise<TreeNode> => {
      if (!node) {
        path.push(val);
        setInternalHighlightNodes([...path]);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { value: val };
      }

      path.push(node.value);
      setInternalHighlightNodes([...path]);
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (val < node.value) {
        return { ...node, left: await insertAnimated(node.left, val) };
      } else {
        return { ...node, right: await insertAnimated(node.right, val) };
      }
    };

    const newTree = await insertAnimated(treeData, value);
    setTreeData(newTree);
    setInternalHighlightNodes([]);
    setOperationResult({
      success: true,
      message: `✅ Node ${value} inserted successfully! Path: ${path.join(' → ')}`
    });
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
    setOperationResult(null);
    setInternalHighlightNodes([]);
  };

  const deleteNode = async (value: number) => {
    setOperationResult(null);
    setInternalHighlightNodes([]);

    // First, find the node and show the path with animation
    const path: number[] = [];
    let found = false;

    const findNodeAnimated = async (node: TreeNode | null, val: number): Promise<boolean> => {
      if (!node) return false;

      path.push(node.value);
      setInternalHighlightNodes([...path]);
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (val === node.value) {
        found = true;
        return true;
      } else if (val < node.value) {
        return await findNodeAnimated(node.left, val);
      } else {
        return await findNodeAnimated(node.right, val);
      }
    };

    // Animate finding the node
    const nodeExists = await findNodeAnimated(treeData, value);
    
    if (!nodeExists) {
      setOperationResult({
        success: false,
        message: `❌ Node with value ${value} not found in tree. Path searched: ${path.join(' → ')}`
      });
      setTimeout(() => setInternalHighlightNodes([]), 1000);
      return;
    }

    // Highlight the node to delete for a moment
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Now perform the deletion
    const findMin = (node: TreeNode): TreeNode => {
      while (node.left) {
        node = node.left;
      }
      return node;
    };

    const deleteRecursive = (node: TreeNode | null, val: number): TreeNode | null => {
      if (!node) return null;

      if (val < node.value) {
        return { ...node, left: deleteRecursive(node.left, val) };
      } else if (val > node.value) {
        return { ...node, right: deleteRecursive(node.right, val) };
      } else {
        // Node to delete found
        if (!node.left) return node.right;
        if (!node.right) return node.left;

        // Node has two children - find inorder successor
        const minNode = findMin(node.right);
        return {
          ...node,
          value: minNode.value,
          right: deleteRecursive(node.right, minNode.value)
        };
      }
    };

    const newTree = deleteRecursive(treeData, value);
    setTreeData(newTree);
    setInternalHighlightNodes([]);
    setOperationResult({
      success: true,
      message: `✅ Node ${value} deleted successfully! Path to deletion: ${path.join(' → ')}`
    });
  };

  const searchInTree = async (value: number) => {
    setOperationResult(null);
    setInternalHighlightNodes([]);

    const path: number[] = [];
    let found = false;

    const searchRecursive = async (node: TreeNode | null, val: number): Promise<boolean> => {
      if (!node) return false;

      path.push(node.value);
      setInternalHighlightNodes([...path]);
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (val === node.value) {
        found = true;
        return true;
      } else if (val < node.value) {
        return await searchRecursive(node.left, val);
      } else {
        return await searchRecursive(node.right, val);
      }
    };

    await searchRecursive(treeData, value);

    setOperationResult({
      success: found,
      message: found 
        ? `✅ Found ${value}! Path: ${path.join(' → ')}` 
        : `❌ ${value} not found in tree. Searched path: ${path.join(' → ')}`
    });
  };

  const traverseTree = async () => {
    setOperationResult(null);
    setInternalHighlightNodes([]);

    const traversal: number[] = [];

    if (algorithm === 'inorder') {
      const inorder = async (node: TreeNode | null) => {
        if (!node) return;
        await inorder(node.left);
        traversal.push(node.value);
        setInternalHighlightNodes([...traversal]);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await inorder(node.right);
      };
      await inorder(treeData);
      setOperationResult({
        success: true,
        message: `✅ Inorder Traversal: ${traversal.join(' → ')}`
      });
    } else if (algorithm === 'preorder') {
      const preorder = async (node: TreeNode | null) => {
        if (!node) return;
        traversal.push(node.value);
        setInternalHighlightNodes([...traversal]);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await preorder(node.left);
        await preorder(node.right);
      };
      await preorder(treeData);
      setOperationResult({
        success: true,
        message: `✅ Preorder Traversal: ${traversal.join(' → ')}`
      });
    } else if (algorithm === 'postorder') {
      const postorder = async (node: TreeNode | null) => {
        if (!node) return;
        await postorder(node.left);
        await postorder(node.right);
        traversal.push(node.value);
        setInternalHighlightNodes([...traversal]);
        await new Promise((resolve) => setTimeout(resolve, 500));
      };
      await postorder(treeData);
      setOperationResult({
        success: true,
        message: `✅ Postorder Traversal: ${traversal.join(' → ')}`
      });
    } else if (algorithm === 'bfs') {
      const queue: TreeNode[] = [];
      if (treeData) queue.push(treeData);
      
      while (queue.length > 0) {
        const node = queue.shift()!;
        traversal.push(node.value);
        setInternalHighlightNodes([...traversal]);
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }
      setOperationResult({
        success: true,
        message: `✅ BFS Traversal: ${traversal.join(' → ')}`
      });
    }
  };

  const runOperation = async () => {
    if (!inputValue.trim() && operation !== 'traverse') return;
    if (!treeData && operation !== 'add') return;
    
    setIsRunning(true);
    setInternalHighlightNodes([]);
    setOperationResult(null);

    try {
      if (operation === 'add') {
        const value = parseInt(inputValue);
        if (isNaN(value)) {
          setOperationResult({
            success: false,
            message: '❌ Please enter a valid number'
          });
        } else {
          await insertNode(value);
        }
      } else if (operation === 'delete') {
        const value = parseInt(inputValue);
        if (isNaN(value)) {
          setOperationResult({
            success: false,
            message: '❌ Please enter a valid number'
          });
        } else {
          await deleteNode(value);
        }
      } else if (operation === 'search') {
        const value = parseInt(inputValue);
        if (isNaN(value)) {
          setOperationResult({
            success: false,
            message: '❌ Please enter a valid number'
          });
        } else {
          await searchInTree(value);
        }
      } else if (operation === 'traverse') {
        await traverseTree();
      }
    } finally {
      setIsRunning(false);
      setInputValue('');
    }
  };

  return (
    <div className="w-full glass-card p-6 rounded-xl overflow-hidden">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-4 gradient-text">Binary Tree Visualization</h3>
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value as 'add' | 'delete' | 'search' | 'traverse')}
            className="px-4 py-2 glass-card border border-indigo-200 dark:border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white"
          >
            <option value="add">Add Node</option>
            <option value="delete">Delete Node</option>
            <option value="search">Search Node</option>
            <option value="traverse">Traverse Tree</option>
          </select>
          
          {operation === 'traverse' && (
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as 'inorder' | 'preorder' | 'postorder' | 'bfs')}
              className="px-4 py-2 glass-card border border-indigo-200 dark:border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white"
            >
              <option value="inorder">Inorder</option>
              <option value="preorder">Preorder</option>
              <option value="postorder">Postorder</option>
              <option value="bfs">BFS</option>
            </select>
          )}

          {operation !== 'traverse' && (
            <input
              type="number"
              placeholder={operation === 'add' ? 'Value to add' : operation === 'delete' ? 'Value to delete' : 'Value to search'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isRunning) {
                  runOperation();
                }
              }}
              className="px-4 py-2 glass-card border border-indigo-200 dark:border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-40"
              disabled={isRunning}
            />
          )}

          <button
            onClick={runOperation}
            disabled={isRunning || (operation !== 'traverse' && !inputValue.trim()) || (!treeData && operation !== 'add')}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isRunning ? 'Running...' : '▶ Run'}
          </button>

          <button
            onClick={generateRandomTree}
            className="px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Generate Random Tree
          </button>
        </div>
        {operationResult && (
          <div className={`p-4 rounded-lg mb-4 ${
            operationResult.success 
              ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700' 
              : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700'
          }`}>
            <p className={`font-semibold ${
              operationResult.success 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {operationResult.message}
            </p>
          </div>
        )}
      </div>
      <div className="w-full overflow-auto rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border border-indigo-200/50 dark:border-indigo-800/50">
        <svg
          ref={svgRef}
          width="100%"
          height="500"
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid meet"
          className="rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
          style={{ minWidth: '600px', maxWidth: '100%' }}
        />
      </div>
    </div>
  );
}

