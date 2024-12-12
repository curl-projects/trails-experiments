import React, { useState, useCallback } from 'react';
import { FeedContainer } from './FeedContainer/FeedContainer';
import { FeedLog } from './FeedLog/FeedLog';
import { FeedControls } from './FeedControls/FeedControls';
import styles from './FeedConsumerLayout.module.css';
import { Event } from '~/types/FeedTypes';
import { useEventContext } from '~/context/FeedEventContext';

export function FeedConsumerLayout({ events, onTriggerSearch }: { events: Event[], onTriggerSearch: (searchParams: any) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [feedLogWidth, setFeedLogWidth] = useState(33); // Initial width in percentage
  const { setEvents } = useEventContext();

  const handleResetFeed = useCallback(() => {
    setEvents([]); // Reset events to empty array
  }, [setEvents]);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const containerRect = e.currentTarget.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        
        // Limit the width between 20% and 80%
        const clampedWidth = Math.min(Math.max(newWidth, 20), 80);
        setFeedLogWidth(clampedWidth);
      }
    },
    [isDragging]
  );

  return (
    <div 
      className={styles.feedConsumerContainer}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className={styles.mainContent}>
        <div 
          className={styles.feedLog}
          style={{ flex: `0 0 ${feedLogWidth}%` }}
        >
          <FeedControls 
            onTriggerSearch={onTriggerSearch} 
            onResetFeed={handleResetFeed}
            events={events}
          />
          <FeedLog events={events} />
        </div>
        
        <div 
          className={styles.divider}
          onMouseDown={handleMouseDown}
        />

        <div className={styles.content}>
          <FeedContainer events={events} />
        </div>
      </div>
    </div>
  );
} 