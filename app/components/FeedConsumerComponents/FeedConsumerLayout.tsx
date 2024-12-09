import React from 'react';
import { FeedContainer } from './FeedContainer/FeedContainer';
import { FeedLog } from './FeedLog/FeedLog';
import styles from './FeedConsumerLayout.module.css';
import { Event } from '~/types/FeedTypes';

export function FeedConsumerLayout({ events }: { events: Event[] }) {
  return (
    <div className={styles.feedConsumerContainer}>
      <div className={styles.mainContent}>
        <div className={styles.feedLog}>
          <FeedLog
            events={events}
          />
        </div>
        <div className={styles.content}>
          <FeedContainer events={events} />
        </div>
      </div>
    </div>
  );
} 