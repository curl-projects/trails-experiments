import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import styles from './FeedControls.module.css';
import { useEventContext } from '~/context/FeedEventContext';
import { FaChevronDown, FaChevronUp, FaMinus, FaPlus } from 'react-icons/fa';

interface FeedControlsProps {
  onTriggerSearch: (searchParams: any) => void;
}

const AVAILABLE_STRATEGIES = [
  'Authorial Identity',
  'Referential Similarity',
  'Conceptual Similarity',
  'Temporal Proximity'
];

export const FeedControls: React.FC<FeedControlsProps> = ({ onTriggerSearch }) => {
  const [inputNodes, setInputNodes] = useState('b509d1a2-e9f3-4605-b027-44eb62f10e6d');
  const [startTypes, setStartTypes] = useState('Post');
  const [targetTypes, setTargetTypes] = useState('Author');
  const [maxDepth, setMaxDepth] = useState(1);
  const [minDepth, setMinDepth] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(100);
  const [preventCycles, setPreventCycles] = useState(true);
  const [selectedStrategies, setSelectedStrategies] = useState(['Authorial Identity']);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const { events, setEvents } = useEventContext();
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleStrategyToggle = (strategy: string) => {
    setSelectedStrategies(prev => 
      prev.includes(strategy)
        ? prev.filter(s => s !== strategy)
        : [...prev, strategy]
    );
  };

  const handleSearch = () => {
    const searchParams = {
      input_nodes: inputNodes.split(',').map((id) => ({ id: id.trim(), type: 'Post' })),
      start_types: startTypes ? startTypes.split(',').map((s) => s.trim()) : 'All',
      target_types: targetTypes ? targetTypes.split(',').map((s) => s.trim()) : null,
      max_depth: maxDepth,
      min_depth: minDepth,
      total_candidates: totalCandidates,
      prevent_cycles: preventCycles,
      strategies: selectedStrategies,
    };
    onTriggerSearch(searchParams);
  };

  return (
    <Draggable nodeRef={nodeRef}>
      <div ref={nodeRef} className={styles['feed-controls']}>
        <div className={styles.header}>
          <h3>Feed Controls</h3>
          <div style={{flex: 1}}/>
          <button 
            className={styles.minimizeButton}
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <FaPlus size={12} /> : <FaMinus size={12} />}
          </button>
        </div>
        
        {!isMinimized && (
          <>
            <div className={styles.inputGroup}>
              <label>Input Nodes (IDs, comma-separated):</label>
              <input
                type="text"
                value={inputNodes}
                onChange={(e) => setInputNodes(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Start Types (comma-separated):</label>
              <input
                type="text"
                value={startTypes}
                onChange={(e) => setStartTypes(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Target Types (comma-separated):</label>
              <input
                type="text"
                value={targetTypes}
                onChange={(e) => setTargetTypes(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Max Depth:</label>
              <input
                type="number"
                min="1"
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
              />
            </div>

            <div className={styles.strategiesGroup}>
              <label>Strategies:</label>
              {AVAILABLE_STRATEGIES.map(strategy => (
                <label key={strategy} className={styles.strategyOption}>
                  <input
                    type="checkbox"
                    checked={selectedStrategies.includes(strategy)}
                    onChange={() => handleStrategyToggle(strategy)}
                  />
                  {strategy}
                </label>
              ))}
            </div>

            <div 
              className={styles.advancedToggle}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>Advanced Options</span>
              {showAdvanced ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {showAdvanced && (
              <div className={styles.advancedOptions}>
                <div className={styles.inputGroup}>
                  <label>Min Depth:</label>
                  <input
                    type="number"
                    min="1"
                    max={maxDepth}
                    value={minDepth}
                    onChange={(e) => setMinDepth(Number(e.target.value))}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Total Candidates:</label>
                  <input
                    type="number"
                    min="1"
                    value={totalCandidates}
                    onChange={(e) => setTotalCandidates(Number(e.target.value))}
                  />
                </div>

                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={preventCycles}
                      onChange={(e) => setPreventCycles(e.target.checked)}
                    />
                    Prevent Cycles
                  </label>
                </div>
              </div>
            )}

            <button onClick={handleSearch}>Trigger Search</button>
          </>
        )}
      </div>
    </Draggable>
  );
};