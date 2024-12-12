import React from 'react';
import styles from './FailedPathsPanel.module.css';
import { Event } from '~/types/FeedTypes';
import { FailedPathCard } from './FailedPathCard';

interface FailedPathsPanelProps {
  events: Event[];
}

export const FailedPathsPanel: React.FC<FailedPathsPanelProps> = ({ events }) => {
  // Extract failed paths from events
  const failedPaths = events
    .filter(event => 
      event.event_type === 'data' && 
      event.data_type === 'debug_record'
    )
    .map(event => ({
      id: event.id,
      message: event.message,
      traceback: JSON.stringify(event.data, null, 2),
      timestamp: event.timestamp,
      details: event.details
    }));

  return (
    <div className={styles.panel}>
      {failedPaths.length > 0 ? (
        <div className={styles.failedPathsList}>
          {failedPaths.map((failedPath) => (
            <FailedPathCard 
              key={failedPath.id}
              failedPath={failedPath}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          No failed paths to display. This is where execution errors will appear.
        </div>
      )}
    </div>
  );
}; 