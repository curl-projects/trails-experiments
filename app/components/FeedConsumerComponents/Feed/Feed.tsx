// app/components/Feed.tsx
import React from 'react';
import { Event, NodeEvent } from '~/types/FeedTypes';
import { FeedCard } from '../FeedCard/FeedCard';
import styles from './Feed.module.css';

interface FeedProps {
  events: Event[];
}

export function Feed({ events }: FeedProps) {
  const nodeMap = React.useMemo(() => {
    const map = new Map<string, NodeEvent>();
    events.forEach((event) => {
      if (event.event_type === 'add' || event.event_type === 'update') {
        const nodeId = event.ranked_output?.output.node.id;
        if (nodeId) {
          if (event.event_type === 'update' && !map.has(nodeId)) {
            console.warn(`Update event received for unknown node ID: ${nodeId}`);
          }
          if (event.event_type === 'add' && map.has(nodeId)) {
            console.warn(`Add event received for existing node ID: ${nodeId}`);
          }
          map.set(nodeId, event as NodeEvent);
        }
      }
    });
    
    return map;
  }, [events]);
  return (
    <div className={styles.feed}>
      {[...nodeMap.values()]
        .map((event) => (
          <FeedCard
            key={event.ranked_output.output.node.id}
            rankedOutput={event.ranked_output}
          />
        ))}
    </div>
  );
}