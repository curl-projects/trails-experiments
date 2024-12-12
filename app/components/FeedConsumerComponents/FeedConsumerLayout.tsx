import React, { useState, useCallback } from 'react';
import { FeedContainer } from './FeedContainer/FeedContainer';
import { FeedLog } from './FeedLog/FeedLog';
import { FeedControls } from './FeedControls/FeedControls';
import styles from './FeedConsumerLayout.module.css';
import { Event } from '~/types/FeedTypes';
import { useEventContext } from '~/context/FeedEventContext';
import { PathHighlightProvider } from '~/context/PathHighlightContext';

export function FeedConsumerLayout({ events, onTriggerSearch }: { events: Event[], onTriggerSearch: (searchParams: any) => void }) {
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);
  const [feedLogWidth, setFeedLogWidth] = useState(33); // Initial width in percentage
  const [feedControlsHeight, setFeedControlsHeight] = useState(60); // Initial height in percentage
  const { setEvents } = useEventContext();

  const handleResetFeed = useCallback(() => {
    setEvents([]);
  }, [setEvents]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDraggingHorizontal) {
        const containerRect = e.currentTarget.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        const clampedWidth = Math.min(Math.max(newWidth, 20), 80);
        setFeedLogWidth(clampedWidth);
      }
      if (isDraggingVertical) {
        const feedLogRect = e.currentTarget.querySelector(`.${styles.feedLog}`)?.getBoundingClientRect();
        if (feedLogRect) {
          const relativeY = e.clientY - feedLogRect.top;
          const newHeight = (relativeY / feedLogRect.height) * 100;
          const clampedHeight = Math.min(Math.max(newHeight, 20), 80);
          setFeedControlsHeight(clampedHeight);
        }
      }
    },
    [isDraggingHorizontal, isDraggingVertical]
  );

  return (
    <PathHighlightProvider>
      <div 
        className={styles.feedConsumerContainer}
        onMouseMove={handleMouseMove}
        onMouseUp={() => {
          setIsDraggingHorizontal(false);
          setIsDraggingVertical(false);
        }}
        onMouseLeave={() => {
          setIsDraggingHorizontal(false);
          setIsDraggingVertical(false);
        }}
      >
        <div className={styles.mainContent}>
          <div 
            className={styles.feedLog}
            style={{ flex: `0 0 ${feedLogWidth}%` }}
          >
            <div 
              className={styles.feedControlsContainer}
              style={{ height: `${feedControlsHeight}%` }}
            >
              <FeedControls 
                onTriggerSearch={onTriggerSearch} 
                onResetFeed={handleResetFeed}
                events={events}
              />
            </div>
            
            <div 
              className={styles.verticalDivider}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDraggingVertical(true);
              }}
            />

            <div 
              className={styles.feedLogContainer}
              style={{ height: `${100 - feedControlsHeight}%` }}
            >
              <FeedLog events={events} />
            </div>
          </div>
          
          <div 
            className={styles.horizontalDivider}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDraggingHorizontal(true);
            }}
          />

          <div className={styles.content}>
            <FeedContainer events={events} />
          </div>
        </div>
      </div>
    </PathHighlightProvider>
  );
} 