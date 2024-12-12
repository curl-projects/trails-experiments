import React, { useState } from 'react';
import styles from './FeedControls.module.css';
import { FaMinus, FaPlus, FaSearch, FaChartBar, FaProjectDiagram, FaTrash, FaCode, FaExclamationTriangle } from 'react-icons/fa';
import { SearchPanel } from './SearchPanel/SearchPanel';
import { DistributionsPanel } from './DistributionsPanel/DistributionsPanel';
import { GraphPanel } from './GraphPanel/GraphPanel';
import { ProtocolsPanel } from './ProtocolsPanel/ProtocolsPanel';
import { CompositionsPanel } from './CompositionsPanel/CompositionsPanel';
import { Event } from '~/types/FeedTypes';
import { FailedPathsPanel } from './FailedPathsPanel/FailedPathsPanel';

interface FeedControlsProps {
  onTriggerSearch: (searchParams: any) => void;
  onResetFeed: () => void;
  events: Event[];
}

type PanelType = 'search' | 'protocols' | 'compositions' | 'distributions' | 'graph' | 'failed-paths';

export const FeedControls: React.FC<FeedControlsProps> = ({ onTriggerSearch, onResetFeed, events }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelType>('search');

  return (
    <div className={styles['feed-controls']}>
      <div className={styles.header}>
        <h3>Feed Controls</h3>
        <div className={styles.headerControls}>
          <button 
            className={styles.resetButton}
            onClick={onResetFeed}
            title="Reset Feed"
          >
            <FaTrash size={12} />
          </button>
          <button 
            className={styles.minimizeButton}
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <FaPlus size={12} /> : <FaMinus size={12} />}
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div className={styles.panelTabs}>
            <button
              className={`${styles.panelTab} ${activePanel === 'search' ? styles.active : ''}`}
              onClick={() => setActivePanel('search')}
            >
              <FaSearch /> Search
            </button>
            <button
              className={`${styles.panelTab} ${activePanel === 'protocols' ? styles.active : ''}`}
              onClick={() => setActivePanel('protocols')}
            >
              <FaCode /> Protocols
            </button>
            <button
              className={`${styles.panelTab} ${activePanel === 'compositions' ? styles.active : ''}`}
              onClick={() => setActivePanel('compositions')}
            >
              <FaProjectDiagram /> Compositions
            </button>
            <button
              className={`${styles.panelTab} ${activePanel === 'distributions' ? styles.active : ''}`}
              onClick={() => setActivePanel('distributions')}
            >
              <FaChartBar /> Distributions
            </button>
            <button
              className={`${styles.panelTab} ${activePanel === 'graph' ? styles.active : ''}`}
              onClick={() => setActivePanel('graph')}
            >
              <FaProjectDiagram /> Graph
            </button>
            <button
              className={`${styles.panelTab} ${activePanel === 'failed-paths' ? styles.active : ''}`}
              onClick={() => setActivePanel('failed-paths')}
            >
              <FaExclamationTriangle /> Failed Paths
            </button>
          </div>
          
          {activePanel === 'search' && <SearchPanel onTriggerSearch={onTriggerSearch} />}
          {activePanel === 'protocols' && <ProtocolsPanel />}
          {activePanel === 'compositions' && <CompositionsPanel events={events} />}
          {activePanel === 'distributions' && <DistributionsPanel />}
          {activePanel === 'graph' && <GraphPanel events={events} />}
          {activePanel === 'failed-paths' && <FailedPathsPanel events={events} />}
        </>
      )}
    </div>
  );
};