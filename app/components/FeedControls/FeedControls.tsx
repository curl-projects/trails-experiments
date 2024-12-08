import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import styles from './FeedControls.module.css';
import { useEventContext } from '~/context/FeedEventContext';
interface FeedControlsProps {
  onTriggerSearch: (searchParams: any) => void;
}

export const FeedControls: React.FC<FeedControlsProps> = ({ onTriggerSearch }) => {
  const [inputNodes, setInputNodes] = useState('b509d1a2-e9f3-4605-b027-44eb62f10e6d');
  const [startTypes, setStartTypes] = useState('Post');
  const [targetTypes, setTargetTypes] = useState('Author');
  const [maxDepth, setMaxDepth] = useState(1);

  const { events, setEvents } = useEventContext();

  // Create a ref for the draggable node
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    const searchParams = {
      input_nodes: inputNodes.split(',').map((id) => ({ id: id.trim(), type: 'Post' })),
      start_types: startTypes ? startTypes.split(',').map((s) => s.trim()) : 'All',
      target_types: targetTypes ? targetTypes.split(',').map((s) => s.trim()) : null,
      max_depth: maxDepth,
    };
    // setEvents([]); // reset events with each search
    onTriggerSearch(searchParams);
  };

  return (
    <Draggable nodeRef={nodeRef}>
      <div ref={nodeRef} className={styles['feed-controls']}>
        <h3>Feed Controls</h3>
        <div>
          <label>Input Nodes (IDs, comma-separated):</label>
          <input
            type="text"
            value={inputNodes}
            onChange={(e) => setInputNodes(e.target.value)}
          />
        </div>
        <div>
          <label>Start Types (comma-separated):</label>
          <input
            type="text"
            value={startTypes}
            onChange={(e) => setStartTypes(e.target.value)}
          />
        </div>
        <div>
          <label>Target Types (comma-separated):</label>
          <input
            type="text"
            value={targetTypes}
            onChange={(e) => setTargetTypes(e.target.value)}
          />
        </div>
        <div>
          <label>Max Depth:</label>
          <input
            type="number"
            value={maxDepth}
            onChange={(e) => setMaxDepth(Number(e.target.value))}
          />
        </div>
        <button onClick={handleSearch}>Trigger Search</button>
      </div>
    </Draggable>
  );
};