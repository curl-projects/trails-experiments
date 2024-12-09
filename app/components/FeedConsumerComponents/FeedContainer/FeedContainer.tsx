// app/components/FeedContainer.tsx
import React from 'react';
import { Event } from '~/types/FeedTypes';
import { Feed } from '../Feed/Feed';
import styles from './FeedContainer.module.css';

interface FeedContainerProps {
  events: Event[];
}

export function FeedContainer({ events }: FeedContainerProps) {
  return (
    <div className={styles.feedContainer}>
      <div className={styles.feedContentContainer}>
        <Feed events={events} />
      </div>
    </div>
  );
}