import React, { useEffect, useState, Suspense, useRef } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import styles from './OutputDisplay.module.css';
import { Event } from '~/types/FeedTypes';
import type { ForceGraphMethods } from 'react-force-graph-2d';

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

interface OutputDisplayProps {
  events: Event[];
}

// Lazy import the wrapper component
const ForceGraph2D = React.lazy(() =>
  import('./ForceGraph2DWrapper')
);

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
    console.log("Graph Data:", graphData)
  }, [graphData])

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

        // Define a custom color array
        const colors = [
          '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
          '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
                  ];
        let colorIndex = 0;  
        // Create a color mapping based on labels
        const labelColors: { [label: string]: string } = {};

        // Assign colors to labels
        data.nodes.forEach((node) => {
          const label = node.labels[0]; // Assuming at least one label exists
          if (label && !labelColors[label]) {
            labelColors[label] = colors[colorIndex % colors.length];
            colorIndex++;
          }
        });

        // Format nodes
        const formattedNodes = data.nodes.map((node) => {
          const label = node.labels[0]; // Assuming at least one label exists
          return {
            id: String(node.id),
            name:
              node.properties.username ||
              node.properties.title ||
              node.properties.name ||
              `Node ${node.id}`,
            labels: node.labels,
            color: labelColors[label] || '#cccccc', // Assign color based on label
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
    console.log("HELLO! OUTSIDE", fgRef.current)
    if (fgRef.current) {
        console.log("HELLO!")

        fgRef.current.d3ReheatSimulation(); // Re-heats the simulation to apply new forces

        fgRef.current.d3Force('charge')?.strength(-500); // Increase the negative value for more repulsion
        // fgRef.current.d3Force('link')?.distance(600); // Increase link distance

      // Disable the default centering force
    //   fgRef.current.d3Force('center', null);

      // Increase the repulsive force to spread nodes out more
      

      // Adjust the link distance
    //   fgRef.current.d3Force('link')?.distance(150); // Increase link distance
        // fgRef.current.d3ReheatSimulation(); // Re-heats the simulation to apply new forces
    //   setTimeout(() => {
    //     // fgRef.current.zoomToFit(500, 50); // Duration: 500ms, Padding: 50px
    //   }, 500);
    }
  }, [graphData, fgRef.current]);

  return (
    <div className={styles.outputPanel} ref={outputPanelRef}>
      <ClientOnly>
        {() => {
          return (
            <Suspense fallback={<div>Loading graph...</div>}>
              <ForceGraph2D
                ref={fgRef}
                // forceEngine={"d3"}
                // d3Force={}
                graphData={graphData}
                nodeLabel={(node) => {
                  // Construct HTML content for tooltip
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
                width={dimensions.width}
                height={dimensions.height}
                nodeRelSize={6} // Adjust node size as needed
                linkWidth={1.5} // Adjust link width as needed
                nodeCanvasObjectMode={() => 'replace'}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const label = node.name;
                  const fontSize = Math.max(2, 4 / globalScale); // Adjusted font size for better readability
                  ctx.font = `${fontSize}px monospace`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';

                  // Draw node with increased size
                  const radius = node.val ? Math.sqrt(node.val) * 5 : 10;
                  ctx.fillStyle = node.color || 'gray';
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                  ctx.fill();

                  // Optionally draw node border
                  ctx.lineWidth = 1;
                  ctx.strokeStyle = 'white';
                  ctx.stroke();

                  // Word wrap logic
                  const maxWidth = radius * 2; // Maximum width for text wrapping
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

                  // Draw each line of text
                  const lineHeight = fontSize * 1.2; // Adjust line height as needed
                  const yOffset = -(lines.length - 1) * lineHeight / 2; // Center the text vertically
                  lines.forEach((line, index) => {
                    ctx.fillStyle = 'white';
                    ctx.fillText(line, node.x, node.y + yOffset + (index * lineHeight));
                  });
                }}
                linkCanvasObjectMode={() => 'after'}
                linkCanvasObject={(link, ctx, globalScale) => {
                  const MAX_FONT_SIZE = 8;
                  const LABEL_NODE_MARGIN = 5;
                  const start = link.source;
                  const end = link.target;

                  if (typeof start !== 'object' || typeof end !== 'object') return;

                  // Calculate the midpoint for the label
                  const textPos = Object.assign(
                    {},
                    ...['x', 'y'].map((c) => ({
                      [c]: (start[c] + end[c]) / 2, // Calc mid point
                    }))
                  );

                  // Calculate angle for text rotation
                  const relLink = { x: end.x - start.x, y: end.y - start.y };
                  const angle = Math.atan2(relLink.y, relLink.x);

                  ctx.save();
                  ctx.translate(textPos.x, textPos.y);
                  ctx.rotate(angle);
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';

                  // Adjust position slightly
                  const fontSize = Math.min(MAX_FONT_SIZE, 12 / globalScale);
                  ctx.font = `${fontSize}px Sans-Serif`;
                  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';

                  // Draw background rectangle for label
                  const textWidth = ctx.measureText(link.type).width;
                  const padding = 2;
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                  ctx.fillRect(
                    -textWidth / 2 - padding,
                    -fontSize / 2 - padding,
                    textWidth + padding * 2,
                    fontSize + padding * 2
                  );

                  // Draw text
                  ctx.fillStyle = 'black';
                  ctx.fillText(link.type, 0, 0);
                  ctx.restore();
                }}
                onNodeClick={(node) => {
                  // Zoom in and center the clicked node
                  fgRef.current?.centerAt(node.x, node.y, 500); // 500ms animation
                  fgRef.current?.zoom(2, 500); // Zoom level 2
                }}
                onNodeHover={(node) => {
                  // Optionally change cursor style on hover
                  const canvas = fgRef.current?.canvas as HTMLCanvasElement;
                  if (canvas) {
                    canvas.style.cursor = node ? 'pointer' : '';
                  }
                }}
                onLinkHover={(link) => {
                  // Optionally change cursor style on hover over links
                  const canvas = fgRef.current?.canvas as HTMLCanvasElement;
                  if (canvas) {
                    canvas.style.cursor = link ? 'pointer' : '';
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