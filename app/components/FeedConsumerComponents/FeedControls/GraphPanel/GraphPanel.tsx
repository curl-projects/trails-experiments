import React, { useState, useEffect, useRef, Suspense } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import styles from './GraphPanel.module.css';
import type { ForceGraphMethods } from 'react-force-graph-2d';
import { Event } from '~/types/FeedTypes';

interface NodeData {
  id: string;
  name: string;
  labels: string[];
  color?: string;
  [key: string]: any;
}

interface LinkData {
  source: string;
  target: string;
  type: string;
  [key: string]: any;
}

interface GraphPanelProps {
  events: Event[];
}

// Lazy import the wrapper component
const ForceGraph2D = React.lazy(() => import('./ForceGraph2DWrapper'));

export const GraphPanel: React.FC<GraphPanelProps> = ({ events }) => {
  const [graphData, setGraphData] = useState<{ nodes: NodeData[]; links: LinkData[] }>({
    nodes: [],
    links: [],
  });
  const fgRef = useRef<ForceGraphMethods>();
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [activeTraversals, setActiveTraversals] = useState<
    { path: string[]; progress: number; color: string }[]
  >([]);

  // Function to update dimensions
  const updateDimensions = () => {
    if (graphContainerRef.current) {
      const { width, height } = graphContainerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      // Reheat simulation when dimensions change
      if (fgRef.current) {
        fgRef.current.d3ReheatSimulation();
      }
    }
  };

  // Set up ResizeObserver
  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateDimensions);
    
    if (graphContainerRef.current) {
      resizeObserver.observe(graphContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Initial dimensions update
  useEffect(() => {
    updateDimensions();
  }, []);

  // Process events to set graph data
  useEffect(() => {
    events.forEach((event) => {
      if (event.event_type === 'data' && event.data_type === 'graph') {
        const data = event.data as { nodes: NodeData[]; edges: LinkData[] };

        // Define a custom color array
        const colors = [
          '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
          '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
        ];
        let colorIndex = 0;
        const labelColors: { [label: string]: string } = {};

        // Format nodes
        const formattedNodes = data.nodes.map((node) => {
          const label = node.labels[0];
          if (label && !labelColors[label]) {
            labelColors[label] = colors[colorIndex % colors.length];
            colorIndex++;
          }
          return {
            id: String(node.id),
            name: node.properties.username || node.properties.title || 
                  node.properties.name || `Node ${node.id}`,
            labels: node.labels,
            color: labelColors[label] || '#cccccc',
            ...node.properties,
          };
        });

        // Format links
        const formattedLinks = data.edges.map((edge) => ({
          source: String(edge.from),
          target: String(edge.to),
          type: edge.type,
          ...edge.properties,
        }));

        setGraphData({
          nodes: formattedNodes,
          links: formattedLinks,
        });
      }
    });
  }, [events]);

  // Ensure the graph is centered and appropriately zoomed
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3ReheatSimulation();
      fgRef.current.d3Force('charge')?.strength(-300);
      fgRef.current.d3Force('link')?.distance(75);
        fgRef.current.d3ReheatSimulation();

    }
  }, [graphData, fgRef, dimensions]);

  return (
    <div className={styles.graphContainer} ref={graphContainerRef}>
      <ClientOnly>
        {() => (
          <Suspense fallback={<div>Loading graph...</div>}>
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              width={dimensions.width || 1}
              height={dimensions.height || 1}
              nodeLabel={(node) => {
                let label = `<div><strong>${node.name}</strong><br/>Labels: ${node.labels.join(
                  ', '
                )}<br/>`;
                for (const [key, value] of Object.entries(node)) {
                  if (
                    ![
                      'id',
                      'name',
                      'labels',
                      'x',
                      'y',
                      'vx',
                      'vy',
                      'index',
                      'color',
                    ].includes(key)
                  ) {
                    label += `${key}: ${value}<br/>`;
                  }
                }
                label += '</div>';
                return label;
              }}
              nodeCanvasObjectMode={() => 'replace'}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.name;
                const fontSize = Math.max(2, 4 / globalScale);
                ctx.font = `${fontSize}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                let nodeColor = node.color || 'gray';
                let isInTraversal = false;

                if (activeTraversals.length > 0) {
                  const traversal = activeTraversals[0];

                  const nodeIndices = traversal.path
                    .map((id, idx) => ({ id, idx }))
                    .filter(({ id, idx }) => id === node.id && idx % 2 === 0)
                    .map(({ idx }) => idx);

                  if (traversal.progress >= traversal.path.length) {
                    isInTraversal = nodeIndices.length > 0;
                  } else {
                    if (nodeIndices.some((index) => index <= traversal.progress)) {
                      isInTraversal = true;
                    }
                  }
                }

                const radius = node.val ? Math.sqrt(node.val) * 5 : 10;
                ctx.fillStyle = nodeColor;
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                ctx.fill();

                ctx.lineWidth = isInTraversal ? 3 : 1;
                ctx.strokeStyle = isInTraversal ? 'red' : 'white';
                ctx.stroke();

                const maxWidth = radius * 2;
                const words = label.split(' ');
                let line = '';
                const lines = [];
                for (let n = 0; n < words.length; n++) {
                  const testLine = line + words[n] + ' ';
                  const metrics = ctx.measureText(testLine);
                  const testWidth = metrics.width;
                  if (testWidth > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                  } else {
                    line = testLine;
                  }
                }
                lines.push(line);

                const lineHeight = fontSize * 1.2;
                const yOffset = -((lines.length - 1) * lineHeight) / 2;
                lines.forEach((line, index) => {
                  ctx.fillStyle = 'white';
                  ctx.fillText(line, node.x, node.y + yOffset + index * lineHeight);
                });
              }}
              linkCanvasObjectMode={() => 'after'}
              linkCanvasObject={(link, ctx, globalScale) => {
                const start = link.source;
                const end = link.target;

                if (typeof start !== 'object' || typeof end !== 'object') return;

                let linkColor = 'rgba(170, 170, 170, 0.5)';
                let isInTraversal = false;

                if (activeTraversals.length > 0) {
                  const traversal = activeTraversals[0];

                  const linkIndices = traversal.path
                    .map((id, idx) => ({ id, idx }))
                    .filter(({ id, idx }) => id === link.id && idx % 2 === 1)
                    .map(({ idx }) => idx);

                  if (traversal.progress >= traversal.path.length) {
                    isInTraversal = linkIndices.length > 0;
                  } else {
                    if (linkIndices.some((index) => index <= traversal.progress)) {
                      isInTraversal = true;
                    }
                  }
                }

                ctx.strokeStyle = isInTraversal ? 'red' : linkColor;
                ctx.lineWidth = isInTraversal ? 2 : 1.5;
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();

                const textPos = {
                  x: (start.x + end.x) / 2,
                  y: (start.y + end.y) / 2,
                };

                const relLink = { x: end.x - start.x, y: end.y - start.y };

                let textAngle = Math.atan2(relLink.y, relLink.x);
                if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
                if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

                ctx.save();
                ctx.translate(textPos.x, textPos.y);
                ctx.rotate(textAngle);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const fontSize = Math.min(4, 8 / globalScale);
                ctx.font = `${fontSize}px Sans-Serif`;

                const text = link.type;
                const textWidth = ctx.measureText(text).width;
                const padding = 2;

                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(
                  -textWidth / 2 - padding,
                  -fontSize / 2 - padding,
                  textWidth + padding * 2,
                  fontSize + padding * 2
                );

                ctx.fillStyle = 'black';
                ctx.fillText(text, 0, 0);
                ctx.restore();
              }}
              onNodeClick={(node) => {
                fgRef.current?.centerAt(node.x, node.y, 500);
                fgRef.current?.zoom(2, 500);
              }}
              onNodeHover={(node) => {
                const canvas = fgRef.current?.canvas as HTMLCanvasElement;
                if (canvas) {
                  canvas.style.cursor = node ? 'pointer' : '';
                }
              }}
              onLinkHover={(link) => {
                const canvas = fgRef.current?.canvas as HTMLCanvasElement;
                if (canvas) {
                  canvas.style.cursor = link ? 'pointer' : '';
                }
              }}
            />
          </Suspense>
        )}
      </ClientOnly>
    </div>
  );
}; 