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
const ForceGraph2D = React.lazy(() => import('./ForceGraph2DWrapper'));

// Function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

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

  // State to store active traversals
  const [activeTraversals, setActiveTraversals] = useState<
    { path: string[]; progress: number; color: string }[]
  >([]);

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

  // Process events to set graph data
  useEffect(() => {
    events.forEach((event) => {
      if (event.event_type === 'data' && event.data_type === 'graph') {
        const data = event.data as { nodes: NodeData[]; edges: LinkData[] };

        // Define a custom color array
        const colors = [
          '#1f77b4',
          '#ff7f0e',
          '#2ca02c',
          '#d62728',
          '#9467bd',
          '#8c564b',
          '#e377c2',
          '#7f7f7f',
          '#bcbd22',
          '#17becf',
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
    if (fgRef.current) {
      fgRef.current.d3ReheatSimulation(); // Re-heats the simulation to apply new forces

      fgRef.current.d3Force('charge')?.strength(-400); // Increase the negative value for more repulsion
      fgRef.current.d3Force('link')?.distance(75); // Increase link distance
    }
  }, [graphData]);

  // Function to handle random traversal
  const handleRandomTraversal = () => {
    const newTraversal = generateRandomTraversal();
    if (newTraversal) {
      // Reset previous traversals
      setActiveTraversals([newTraversal]);
    }
  };

  // Function to generate a random traversal path
  const generateRandomTraversal = () => {
    const { nodes, links } = graphData;
    if (nodes.length === 0) return null;

    // Start from a random node
    const startNode = nodes[Math.floor(Math.random() * nodes.length)];
    const visited = new Set<string>();
    const path: string[] = [];

    let currentNode = startNode;

    // Generate random path length between 3 and 8
    let steps = 12; // Random number between 3 and 8

    while (currentNode && steps > 0) {
      path.push(currentNode.id);
      visited.add(currentNode.id);

      console.log("VISITED:", visited)

      // Get all outgoing links from current node
      const outgoingLinks = links.filter((link) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        return (
          (sourceId === currentNode.id && !visited.has(targetId)) ||
          (targetId === currentNode.id && !visited.has(sourceId))
        );
      });

      console.log("CURRENT NODE:", currentNode);
      console.log("LINKS:", links);
      console.log("OUTGOING LINKS:", outgoingLinks);
      if (outgoingLinks.length === 0) break;

      // Randomly select one of the outgoing links
      const randomLink = outgoingLinks[Math.floor(Math.random() * outgoingLinks.length)];
      const sourceId = typeof randomLink.source === 'object' ? randomLink.source.id : randomLink.source;
      const targetId = typeof randomLink.target === 'object' ? randomLink.target.id : randomLink.target;

      // If current node is the source, go to target; if it's the target, go to source
      currentNode = nodes.find((node) => 
        node.id === (currentNode.id === sourceId ? targetId : sourceId)
      );
      steps--;

    //   if (path.length < 3) {
    //     console.log('Generated path is too short, retrying...');
    //     return generateRandomTraversal();
    //   }
  
    }

    // Assign a random color to this traversal
    const color = 'red'; // Use red color for traversal path

    // Log the generated traversal path
    console.log('Generated Traversal Path:', path);

    return { path, progress: 0, color };
  };

  // Update traversal progress over time
  useEffect(() => {
    if (activeTraversals.length === 0) return;

    const interval = setInterval(() => {
      setActiveTraversals((prevTraversals) =>
        prevTraversals
          .map((traversal) => {
            if (traversal.progress < traversal.path.length) {
              const updatedTraversal = {
                ...traversal,
                progress: traversal.progress + 1,
              };
              console.log('Traversal Progress:', updatedTraversal);
              return updatedTraversal;
            } else {
              return traversal;
            }
          })
          .filter((traversal) => traversal.progress < traversal.path.length)
      );
    }, 1000); // Update every 1000ms

    return () => clearInterval(interval);
  }, [activeTraversals]);

  return (
    <div className={styles.outputPanel} ref={outputPanelRef}>
      <button className={styles.traversalButton} onClick={handleRandomTraversal}>
        Traverse Graph
      </button>
      <ClientOnly>
        {() => {
          return (
            <Suspense fallback={<div>Loading graph...</div>}>
              <ForceGraph2D
                ref={fgRef}
                backgroundColor={"dark"} // Add this line for transparency
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

                  // Determine if the node is part of any active traversal
                  let nodeColor = node.color || 'gray';
                  let isInTraversal = false; // Flag to determine if node is in traversal

                  if (activeTraversals.length > 0) {
                    const traversal = activeTraversals[0]; // Since we're resetting traversals, only one traversal will be active

                    const index = traversal.path.indexOf(node.id);
                    if (index >= 0 && index < traversal.progress) {
                      isInTraversal = true;
                    }
                  }

                  // Draw node with increased size
                  const radius = node.val ? Math.sqrt(node.val) * 5 : 10;
                  ctx.fillStyle = nodeColor;
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                  ctx.fill();

                  // Draw node border
                  ctx.lineWidth = isInTraversal ? 3 : 1;
                  ctx.strokeStyle = isInTraversal ? 'red' : 'white';
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
                  const yOffset = -((lines.length - 1) * lineHeight) / 2; // Center the text vertically
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

                  // Determine if the link is part of any active traversal
                  let linkColor = 'rgba(170, 170, 170, 0.5)'; // Default link color
                  let isInTraversal = false;

                  if (activeTraversals.length > 0) {
                    const traversal = activeTraversals[0];

                    const sourceIndex = traversal.path.indexOf(start.id);
                    const targetIndex = traversal.path.indexOf(end.id);
                    if (
                      sourceIndex >= 0 &&
                      targetIndex >= 0 &&
                      sourceIndex < traversal.progress &&
                      targetIndex < traversal.progress &&
                      Math.abs(sourceIndex - targetIndex) === 1
                    ) {
                      isInTraversal = true;
                    }
                  }

                  // Draw the link line
                  ctx.strokeStyle = isInTraversal ? 'red' : linkColor;
                  ctx.lineWidth = isInTraversal ? 2 : 1.5;
                  ctx.beginPath();
                  ctx.moveTo(start.x, start.y);
                  ctx.lineTo(end.x, end.y);
                  ctx.stroke();

                  // Label drawing code (same as before)
                  const textPos = {
                    x: (start.x + end.x) / 2,
                    y: (start.y + end.y) / 2,
                  };

                  const relLink = { x: end.x - start.x, y: end.y - start.y };

                  let textAngle = Math.atan2(relLink.y, relLink.x);
                  // Maintain label horizontal orientation for better readability
                  if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
                  if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

                  ctx.save();
                  ctx.translate(textPos.x, textPos.y);
                  ctx.rotate(textAngle);
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';

                  const fontSize = Math.min(4, 8 / globalScale);
                  ctx.font = `${fontSize}px Sans-Serif`;
                  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';

                  const text = link.type;
                  const textWidth = ctx.measureText(text).width;
                  const padding = 2;

                  // Draw background rectangle for label
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                  ctx.fillRect(
                    -textWidth / 2 - padding,
                    -fontSize / 2 - padding,
                    textWidth + padding * 2,
                    fontSize + padding * 2
                  );

                  // Draw text
                  ctx.fillStyle = 'black';
                  ctx.fillText(text, 0, 0);
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