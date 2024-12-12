import React from 'react';
import styles from './CompositionsPanel.module.css';
import { Event } from '~/types/FeedTypes';
import { CompositionCard } from './CompositionCard';

interface CompositionsPanelProps {
  events: Event[];
}

export const CompositionsPanel: React.FC<CompositionsPanelProps> = ({ events }) => {
  // Extract unique compositions from events
  const compositions = events
    .filter(event => 
      (event.event_type === 'add' || event.event_type === 'update') && 
      'ranked_output' in event && 
      event.ranked_output
    )
    .flatMap(event => event.ranked_output.output.parameterized_compositions)
    .filter((composition, index, self) => 
      index === self.findIndex(c => c.id === composition.id)
    );

  return (
    <div className={styles.panel}>
      {compositions.length > 0 ? (
        <div className={styles.compositionsList}>
          {compositions.map((composition) => (
            <CompositionCard 
              key={composition.id}
              composition={composition}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          No compositions available. Run a search to see compositions appear here.
        </div>
      )}
    </div>
  );
}; 