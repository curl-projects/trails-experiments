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

  // Calculate counts
  const protocolCount = events
    .filter(event => event.event_type === 'data' && event.data_type === 'protocols')
    .flatMap(event => event.data).length;

  const compositionCount = events
    .filter(event => 
      (event.event_type === 'add' || event.event_type === 'update') && 
      'ranked_output' in event
    )
    .flatMap(event => event.ranked_output.output.parameterized_compositions)
    .filter((composition, index, self) => 
      index === self.findIndex(c => c.id === composition.id)
    ).length;

  const failedPathCount = events
    .filter(event => 
      event.event_type === 'data' && 
      event.data_type === 'debug_record'
    ).length;

  // Calculate graph node count
  const graphNodeCount = events
    .filter(event => event.event_type === 'data' && event.data_type === 'graph')
    .reduce((count, event) => {
      const graphData = event.data as { nodes: any[] };
      return graphData.nodes.length;
    }, 0);

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
              <span className={styles.badge}>{protocolCount}</span>
            </button>
            <button
              className={`${styles.panelTab} ${activePanel === 'compositions' ? styles.active : ''}`}
              onClick={() => setActivePanel('compositions')}
            >
              <FaProjectDiagram /> Compositions
              <span className={styles.badge}>{compositionCount}</span>
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
              <span className={styles.badge}>{graphNodeCount}</span>
            </button>
            <button
              className={`${styles.panelTab} ${activePanel === 'failed-paths' ? styles.active : ''}`}
              onClick={() => setActivePanel('failed-paths')}
            >
              <FaExclamationTriangle /> Failed Paths
              <span className={styles.badge}>{failedPathCount}</span>
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