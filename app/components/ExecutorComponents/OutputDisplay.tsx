import React, { useEffect, useState, Suspense, useRef } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import styles from './OutputDisplay.module.css';
import { Event } from '~/types/FeedTypes';
import type { ForceGraphMethods } from 'react-force-graph-2d';

interface NodeData {
  id: string;
  name: string;
  labels: string[];
  [key: string]: any;
}

interface LinkData {
  source: string;
  target: string;
  type: string;
  [key: string]: any;
}

interface OutputDisplayProps {
  events: Event[];
}

export function OutputDisplay({ events }: OutputDisplayProps) {
  const [graphData, setGraphData] = useState<{ nodes: NodeData[]; links: LinkData[] }>({
    nodes: [],
    links: [],
  });

  const fgRef = useRef<ForceGraphMethods>();
  const outputPanelRef = useRef<HTMLDivElement>(null);

  // State to store the dimensions
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Function to update dimensions
  const updateDimensions = () => {
    if (outputPanelRef.current) {
      setDimensions({
        width: outputPanelRef.current.offsetWidth,
        height: outputPanelRef.current.offsetHeight,
      });
    }
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    events.forEach((event) => {
      if (event.event_type === 'data' && event.data_type === 'graph') {
        const data = event.data as { nodes: NodeData[]; edges: LinkData[] };

        // Format nodes
        const formattedNodes = data.nodes.map((node) => ({
          id: String(node.id),
          name:
            node.properties.username ||
            node.properties.title ||
            node.properties.name ||
            `Node ${node.id}`,
          labels: node.labels,
          ...node.properties,
        }));

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
      // Disable the default centering force
      fgRef.current.d3Force('center', null);
      setTimeout(() => {
        fgRef.current.zoomToFit(500, 50); // Duration: 500ms, Padding: 50px
      }, 500);
    }
  }, [graphData]);

  return (
    <div className={styles.outputPanel} ref={outputPanelRef}>
      <ClientOnly>
        {() => {
          const ForceGraph2D = React.lazy(() =>
            import('react-force-graph-2d').then((module) => ({
              default: module.default || module,
            }))
          );

          return (
            <Suspense fallback={<div>Loading graph...</div>}>
              <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                nodeLabel={(node) => {
                  // Construct tooltip content with labels and metadata
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
                nodeAutoColorBy="labels[0]"
                width={dimensions.width}
                height={dimensions.height}
                nodeRelSize={10} // Increase node size
                linkWidth={2} // Increase link width
                nodeCanvasObjectMode={() => 'replace'}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const label = node.name;
                  const fontSize = 10 / globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';

                  // Draw node with increased size
                  const radius = node.val ? Math.sqrt(node.val) * 5 : 10;
                  ctx.fillStyle = node.color || 'gray';
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                  ctx.fill();

                  // Draw node label
                  ctx.fillStyle = 'white';
                  ctx.fillText(label, node.x, node.y);
                }}
                linkCanvasObjectMode={() => 'after'}
                linkCanvasObject={(link, ctx, globalScale) => {
                  const MAX_FONT_SIZE = 6;
                  const LABEL_NODE_MARGIN = 10;
                  const start = link.source;
                  const end = link.target;

                  if (typeof start !== 'object' || typeof end !== 'object') return;

                  // Calculate the midpoint for the label
                  const textPos = Object.assign(
                    {},
                    ...['x', 'y'].map((c) => ({
                      [c]: start[c] + (end[c] - start[c]) / 2, // Calc mid point
                    }))
                  );

                  // Rotate text to align with link
                  const relLink = { x: end.x - start.x, y: end.y - start.y };
                  const norm = Math.sqrt(relLink.x * relLink.x + relLink.y * relLink.y);
                  if (norm === 0) return;

                  const angle = Math.atan2(relLink.y, relLink.x);

                  // Prevent upside-down text
                  const rotation =
                    angle > Math.PI / 2 || angle < -Math.PI / 2 ? angle + Math.PI : angle;

                  const fontSize = Math.min(MAX_FONT_SIZE, 8 / globalScale);
                  ctx.font = `${fontSize}px Sans-Serif`;
                  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';

                  ctx.save();
                  ctx.translate(textPos.x, textPos.y);
                  ctx.rotate(rotation);
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillText(link.type, 0, -LABEL_NODE_MARGIN);
                  ctx.restore();
                }}
                onNodeClick={(node) => {
                  // Zoom in and center the clicked node
                  fgRef.current?.centerAt(node.x, node.y, 1000); // 1000ms animation
                  fgRef.current?.zoom(4, 1000); // Zoom level 4
                }}
                onNodeHover={(node) => {
                  // Optionally change cursor style on hover
                  const canvas = fgRef.current?.canvas; // Corrected access to canvas element
                  if (canvas) {
                    canvas.style.cursor = node ? 'pointer' : '';
                  }
                }}
              />
            </Suspense>
          );
        }}
      </ClientOnly>
    </div>
  );
}