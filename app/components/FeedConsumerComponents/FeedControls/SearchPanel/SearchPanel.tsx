import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './SearchPanel.module.css';
import { TypeSelector } from './TypeSelector/TypeSelector';

interface SearchPanelProps {
  onTriggerSearch: (searchParams: any) => void;
}

const AVAILABLE_TYPES = ['Post', 'Author', 'Concept', 'Topic', 'Reference'];

const AVAILABLE_STRATEGIES = [
  'Authorial Identity',
  'Referential Similarity',
  'Conceptual Similarity',
  'Temporal Proximity'
];

export const SearchPanel: React.FC<SearchPanelProps> = ({ onTriggerSearch }) => {
  const [inputNodes, setInputNodes] = useState('b509d1a2-e9f3-4605-b027-44eb62f10e6d');
  const [startTypes, setStartTypes] = useState<string[]>(['Post']);
  const [targetTypes, setTargetTypes] = useState<string[]>(['Author', 'Concept']);
  const [maxDepth, setMaxDepth] = useState(2);
  const [minDepth, setMinDepth] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(100);
  const [preventCycles, setPreventCycles] = useState(true);
  const [selectedStrategies, setSelectedStrategies] = useState(['Authorial Identity', "Referential Similarity"]);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      start_types: startTypes.length > 0 ? startTypes : 'All',
      target_types: targetTypes.length > 0 ? targetTypes : null,
      max_depth: maxDepth,
      min_depth: minDepth,
      total_candidates: totalCandidates,
      prevent_cycles: preventCycles,
      strategies: selectedStrategies,
    };
    onTriggerSearch(searchParams);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.inputGroup}>
        <label>Input Nodes (IDs, comma-separated):</label>
        <input
          type="text"
          value={inputNodes}
          onChange={(e) => setInputNodes(e.target.value)}
        />
      </div>

      <TypeSelector
        label="Start Types"
        selectedTypes={startTypes}
        setSelectedTypes={setStartTypes}
        availableTypes={AVAILABLE_TYPES}
      />

      <TypeSelector
        label="Target Types"
        selectedTypes={targetTypes}
        setSelectedTypes={setTargetTypes}
        availableTypes={AVAILABLE_TYPES}
      />

      <div className={styles.inputGroup}>
        <label>Max Depth: {maxDepth}</label>
        <input
          type="range"
          min="1"
          max="10"
          value={maxDepth}
          onChange={(e) => setMaxDepth(Number(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.sliderLabels}>
          <span>1</span>
          <span>10</span>
        </div>
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
    </div>
  );
}; 