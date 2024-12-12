import React, { useState } from 'react';
import styles from './DistributionsPanel.module.css';
import { DistributionRow } from './DistributionRow/DistributionRow';
import { FaDatabase, FaProjectDiagram, FaSortAmountUp } from 'react-icons/fa';

type SubPanelType = 'inputs' | 'protocols' | 'ranking';

// Example data organized by panel
const distributions = {
  inputs: [
    {
      title: "Author Similarity",
      subtitle: "Confidence in author relationship based on writing style",
      alpha: 8.5,
      beta: 2.3,
    },
    {
      title: "Content Relevance",
      subtitle: "Direct content relationship confidence",
      alpha: 6.2,
      beta: 1.8,
    },
  ],
  protocols: [
    {
      title: "Protocol Composition",
      subtitle: "Confidence in protocol chain effectiveness",
      alpha: 4.2,
      beta: 3.8,
    },
    {
      title: "Chain Coherence",
      subtitle: "Protocol transition confidence",
      alpha: 7.1,
      beta: 2.4,
    },
    {
      title: "Protocol Performance",
      subtitle: "Individual protocol effectiveness",
      alpha: 5.5,
      beta: 2.2,
    },
  ],
  ranking: [
    {
      title: "Global Rank",
      subtitle: "Overall confidence distribution",
      alpha: 12.3,
      beta: 3.1,
    },
    {
      title: "Local Rank",
      subtitle: "Contextual ranking confidence",
      alpha: 6.7,
      beta: 4.2,
    },
    {
      title: "Temporal Decay",
      subtitle: "Time-based confidence adjustment",
      alpha: 2.1,
      beta: 5.4,
    },
  ],
};

export const DistributionsPanel: React.FC = () => {
  const [activePanel, setActivePanel] = useState<SubPanelType>('inputs');

  return (
    <div className={styles.panel}>
      <div className={styles.subPanelTabs}>
        <button
          className={`${styles.subPanelTab} ${activePanel === 'inputs' ? styles.active : ''}`}
          onClick={() => setActivePanel('inputs')}
        >
          <FaDatabase /> Inputs
        </button>
        <button
          className={`${styles.subPanelTab} ${activePanel === 'protocols' ? styles.active : ''}`}
          onClick={() => setActivePanel('protocols')}
        >
          <FaProjectDiagram /> Protocols
        </button>
        <button
          className={`${styles.subPanelTab} ${activePanel === 'ranking' ? styles.active : ''}`}
          onClick={() => setActivePanel('ranking')}
        >
          <FaSortAmountUp /> Ranking
        </button>
      </div>

      <div className={styles.subPanelContent}>
        {distributions[activePanel].map((dist, index) => (
          <DistributionRow
            key={index}
            title={dist.title}
            subtitle={dist.subtitle}
            alpha={dist.alpha}
            beta={dist.beta}
          />
        ))}
      </div>
    </div>
  );
}; 