import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphVisualizerProps {
  onNodeClick?: (nodeId: string) => void;
  highlightNodes?: string[];
  highlightEdges?: Array<{ source: string; target: string }>;
}

export default function GraphVisualizer({
  onNodeClick,
  highlightNodes = [],
  highlightEdges = [],
}: GraphVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([
    { id: 'A', x: 100, y: 150, label: 'A' },
    { id: 'B', x: 200, y: 100, label: 'B' },
    { id: 'C', x: 200, y: 200, label: 'C' },
    { id: 'D', x: 300, y: 150, label: 'D' },
    { id: 'E', x: 400, y: 100, label: 'E' },
    { id: 'F', x: 400, y: 200, label: 'F' },
  ]);
  const [edges, setEdges] = useState<GraphEdge[]>([
    { source: 'A', target: 'B' },
    { source: 'A', target: 'C' },
    { source: 'B', target: 'D' },
    { source: 'C', target: 'D' },
    { source: 'D', target: 'E' },
    { source: 'D', target: 'F' },
  ]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

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
    
    // Selected gradient
    const selectedGradient = defs.append('linearGradient')
      .attr('id', 'selectedGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    selectedGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f59e0b')
      .attr('stop-opacity', 1);
    selectedGradient.append('stop')
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
    
    // Add arrow marker (must be in defs before edges)
    const arrowMarker = defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('refX', 9)
      .attr('refY', 3)
      .attr('orient', 'auto');
    arrowMarker.append('polygon')
      .attr('points', '0 0, 10 3, 0 6')
      .attr('fill', '#6366f1')
      .attr('opacity', 0.6);

    const width = svgRef.current.clientWidth || 800;
    const height = 400;

    // Draw edges
    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      const isHighlighted = highlightEdges.some(
        (e) =>
          (e.source === edge.source && e.target === edge.target) ||
          (e.source === edge.target && e.target === edge.source)
      );

      svg
        .append('line')
        .datum(edge) // Store edge data with the line
        .attr('x1', sourceNode.x)
        .attr('y1', sourceNode.y)
        .attr('x2', targetNode.x)
        .attr('y2', targetNode.y)
        .attr('stroke', isHighlighted ? '#ef4444' : '#6366f1')
        .attr('stroke-width', isHighlighted ? 3.5 : 2.5)
        .attr('opacity', isHighlighted ? 1 : 0.6)
        .attr('stroke-linecap', 'round')
        .attr('marker-end', 'url(#arrowhead)');
    });

    // Draw nodes
    const nodeGroups = svg
      .selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', function () {
            setDragging(true);
          })
          .on('drag', function (event, d) {
            if (!d) return;
            d.x = event.x;
            d.y = event.y;
            d3.select(this).attr('transform', `translate(${d.x},${d.y})`);
            // Redraw all edges
            svg.selectAll('line').each(function(edgeData) {
              const edge = edgeData as GraphEdge;
              const sourceNode = nodes.find((n) => n.id === edge.source);
              const targetNode = nodes.find((n) => n.id === edge.target);
              if (sourceNode && targetNode) {
                d3.select(this)
                  .attr('x1', sourceNode.x)
                  .attr('y1', sourceNode.y)
                  .attr('x2', targetNode.x)
                  .attr('y2', targetNode.y);
              }
            });
          })
          .on('end', function () {
            setDragging(false);
          })
      )
      .on('click', function (event, d) {
        event.stopPropagation();
        setSelectedNode(d.id);
        onNodeClick?.(d.id);
      });

    nodeGroups
      .append('circle')
      .attr('r', 28)
      .attr('fill', (d) =>
        highlightNodes.includes(d.id)
          ? 'url(#highlightGradient)'
          : selectedNode === d.id
          ? 'url(#selectedGradient)'
          : 'url(#nodeGradient)'
      )
      .attr('stroke', (d) =>
        highlightNodes.includes(d.id)
          ? '#ef4444'
          : selectedNode === d.id
          ? '#f59e0b'
          : '#6366f1'
      )
      .attr('stroke-width', highlightNodes.includes(d.id) || selectedNode === d.id ? 3 : 2.5)
      .attr('filter', highlightNodes.includes(d.id) || selectedNode === d.id ? 'url(#glow)' : 'none');

    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('text-shadow', '0 1px 2px rgba(0,0,0,0.3)')
      .text((d) => d.label);
  }, [nodes, edges, highlightNodes, highlightEdges, selectedNode, onNodeClick]);

  const addNode = () => {
    const newId = String.fromCharCode(65 + nodes.length);
    const newNode: GraphNode = {
      id: newId,
      x: Math.random() * 600 + 100,
      y: Math.random() * 300 + 50,
      label: newId,
    };
    setNodes([...nodes, newNode]);
  };

  const addEdge = () => {
    if (nodes.length < 2) return;
    const source = nodes[Math.floor(Math.random() * nodes.length)];
    const target = nodes[Math.floor(Math.random() * nodes.length)];
    if (source.id !== target.id) {
      const newEdge: GraphEdge = { source: source.id, target: target.id };
      if (!edges.some((e) => e.source === source.id && e.target === target.id)) {
        setEdges([...edges, newEdge]);
      }
    }
  };

  const bfsTraversal = () => {
    if (nodes.length === 0) return;
    const startNode = nodes[0].id;
    const visited = new Set<string>();
    const queue = [startNode];
    const traversal: string[] = [];
    const highlighted: string[] = [];

    // Build adjacency list
    const adjList: Record<string, string[]> = {};
    nodes.forEach((node) => {
      adjList[node.id] = [];
    });
    edges.forEach((edge) => {
      adjList[edge.source].push(edge.target);
      adjList[edge.target].push(edge.source);
    });

    const animate = () => {
      if (queue.length === 0) return;

      const current = queue.shift()!;
      if (visited.has(current)) {
        animate();
        return;
      }

      visited.add(current);
      traversal.push(current);
      highlighted.push(current);

      // Update highlight
      setTimeout(() => {
        // Highlight logic would go here
      }, 500);

      adjList[current].forEach((neighbor) => {
        if (!visited.has(neighbor) && !queue.includes(neighbor)) {
          queue.push(neighbor);
        }
      });

      if (queue.length > 0) {
        setTimeout(animate, 500);
      }
    };

    animate();
  };

  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
  };

  const generateRandomGraph = () => {
    const nodeCount = 6;
    const newNodes: GraphNode[] = [];
    const newEdges: GraphEdge[] = [];

    for (let i = 0; i < nodeCount; i++) {
      newNodes.push({
        id: String.fromCharCode(65 + i),
        x: Math.random() * 600 + 100,
        y: Math.random() * 300 + 50,
        label: String.fromCharCode(65 + i),
      });
    }

    // Create a connected graph
    for (let i = 0; i < nodeCount - 1; i++) {
      newEdges.push({
        source: newNodes[i].id,
        target: newNodes[i + 1].id,
      });
    }

    // Add some random edges
    for (let i = 0; i < nodeCount; i++) {
      const source = newNodes[Math.floor(Math.random() * nodeCount)];
      const target = newNodes[Math.floor(Math.random() * nodeCount)];
      if (
        source.id !== target.id &&
        !newEdges.some((e) => e.source === source.id && e.target === target.id)
      ) {
        newEdges.push({ source: source.id, target: target.id });
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };

  return (
    <div className="w-full glass-card p-6 rounded-xl overflow-hidden">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-4 gradient-text">Graph Visualization</h3>
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <button
            onClick={addNode}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Add Node
          </button>
          <button
            onClick={addEdge}
            disabled={nodes.length < 2}
            className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Add Edge
          </button>
          <button
            onClick={bfsTraversal}
            disabled={nodes.length === 0}
            className="px-5 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg hover:from-yellow-700 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            BFS Traversal
          </button>
          <button
            onClick={generateRandomGraph}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Generate Random
          </button>
          <button
            onClick={clearGraph}
            className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Clear
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click and drag nodes to move them. Click a node to select it.
        </p>
      </div>
      <div className="w-full overflow-x-auto rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border border-indigo-200/50 dark:border-indigo-800/50">
        <svg
          ref={svgRef}
          width="100%"
          height="400"
          className="rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm min-w-[600px]"
        />
      </div>
    </div>
  );
}

