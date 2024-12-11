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
  pathData: any;
  traversalPath: any;
}

// Lazy import the wrapper component
const ForceGraph2D = React.lazy(() => import('~/components/ExecutorComponents/ForceGraph2DWrapper'));

// Function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export function OutputDisplay({ events, pathData, traversalPath }: OutputDisplayProps) {
  const [graphData, setGraphData] = useState<{ nodes: NodeData[]; links: LinkData[] }>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    console.log("TRAVERSAL PATH:", traversalPath);
    if (traversalPath) {
      // Create mappings from internal IDs to properties.id
      const nodeIdToPropertiesId: { [key: string]: string } = {};
      traversalPath.nodes.forEach((node) => {
        nodeIdToPropertiesId[node.id] = node.properties.id;
      });

      const relIdToPropertiesId: { [key: string]: string } = {};
      traversalPath.relationships.forEach((rel) => {
        relIdToPropertiesId[rel.id] = rel.properties.id;
      });

      // Initialize the path array
      const path: string[] = [];

      // Start from the first relationship's start node
      if (traversalPath.relationships.length > 0) {
        let currentNodeId = traversalPath.relationships[0].start_node_id;
        path.push(nodeIdToPropertiesId[currentNodeId]);

        // Iterate over relationships to build the path
        traversalPath.relationships.forEach((rel) => {
          // Add relationship's properties.id
          path.push(rel.properties.id);

          // Add the next node's properties.id
          const nextNodeId = rel.end_node_id;
          path.push(nodeIdToPropertiesId[nextNodeId]);

          // Update current node ID for next iteration
          currentNodeId = nextNodeId;
        });
      } else if (traversalPath.nodes.length > 0) {
        // If there are no relationships, add nodes' properties.id to path
        traversalPath.nodes.forEach((node) => {
          path.push(node.properties.id);
        });
      }

      // Create the new traversal object
      const newTraversal = {
        path: path,
        progress: 0,
        color: 'red',
      };

      console.log("NEW TRAVERSAL:", newTraversal);

      // Update the active traversals state
      setActiveTraversals([newTraversal]);
    }
  }, [traversalPath]);

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

  useEffect(()=>{
    console.log("PATH DATA:", pathData)
  }, [pathData])

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
    const visitedNodes = new Set<string>();
    const visitedLinks = new Set<string>();
    const path: string[] = [];

    let currentNode = startNode;
    visitedNodes.add(currentNode.id);
    path.push(currentNode.id);

    // Set the number of steps to take
    let steps = 12; // Adjust as needed

    while (currentNode && steps > 0) {
      // Get all outgoing links from current node that lead to unvisited nodes
      const outgoingLinks = links.filter((link) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        const otherNodeId = currentNode.id === sourceId ? targetId : sourceId;
        return (
          (sourceId === currentNode.id || targetId === currentNode.id) &&
          !visitedNodes.has(otherNodeId) &&
          !visitedLinks.has(link.id)
        );
      });

      if (outgoingLinks.length === 0) break;

      // Randomly select one of the outgoing links
      const randomLink = outgoingLinks[Math.floor(Math.random() * outgoingLinks.length)];

      // Add the link's id to the path
      path.push(randomLink.id);
      visitedLinks.add(randomLink.id);

      const sourceId = typeof randomLink.source === 'object' ? randomLink.source.id : randomLink.source;
      const targetId = typeof randomLink.target === 'object' ? randomLink.target.id : randomLink.target;
      
      // Determine the next node
      const nextNodeId = currentNode.id === sourceId ? targetId : sourceId;

      // Move to next node
      currentNode = nodes.find((node) => node.id === nextNodeId);

      if (!currentNode) break; // Safety check

      // Add next node's id to the path
      path.push(currentNode.id);
      visitedNodes.add(currentNode.id);

      steps--;
    }

    // Assign a color to this traversal
    const color = 'red';

    // Log the generated traversal path
    console.log('Generated Traversal Path:', path);

    return { path, progress: 0, color };
  };

  // Update traversal progress over time
  useEffect(() => {
    if (activeTraversals.length === 0) return;

    const interval = setInterval(() => {
      setActiveTraversals((prevTraversals) =>
        prevTraversals.map((traversal) => {
          if (traversal.progress < traversal.path.length) {
            // Continue incrementing progress
            return { ...traversal, progress: traversal.progress + 1 };
          } else {
            // Traversal is complete, keep it in state
            return traversal;
          }
        })
      );
    }, 100);

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

                    const nodeIndices = traversal.path
                      .map((id, idx) => ({ id, idx }))
                      .filter(({ id, idx }) => id === node.id && idx % 2 === 0)
                      .map(({ idx }) => idx);

                      if (traversal.progress >= traversal.path.length) {
                        // Traversal complete: highlight all nodes
                        isInTraversal = nodeIndices.length > 0;
                      } else {
                        if (nodeIndices.some((index) => index <= traversal.progress)) {
                          isInTraversal = true;
                        }
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

                    const linkIndices = traversal.path
                      .map((id, idx) => ({ id, idx }))
                      .filter(({ id, idx }) => id === link.id && idx % 2 === 1)
                      .map(({ idx }) => idx);

                    if (traversal.progress >= traversal.path.length) {
                      // Traversal complete: highlight all links in the path
                      isInTraversal = linkIndices.length > 0;
                    } else {
                      // Highlight links up to current progress
                      if (linkIndices.some((index) => index <= traversal.progress)) {
                        isInTraversal = true;
                      }
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