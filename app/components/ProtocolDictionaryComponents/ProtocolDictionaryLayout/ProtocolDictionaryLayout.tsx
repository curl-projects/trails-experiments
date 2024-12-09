import React from 'react';
import { Protocol, Event } from '~/types/FeedTypes';
import ProtocolList from '~/components/ProtocolDictionaryComponents/ProtocolList';
import { FeedLog } from '~/components/FeedConsumerComponents/FeedLog/FeedLog';
import styles from './ProtocolDictionaryLayout.module.css';

interface ProtocolDictionaryLayoutProps {
  protocols: Protocol[];
  events: Event[];
}

export function ProtocolDictionaryLayout({ protocols, events }: ProtocolDictionaryLayoutProps) {
  return (
    <div className={styles.protocolDictionaryContainer}>
      <div className={styles.mainContent}>
        <div className={styles.feedLog}>
          <FeedLog events={events} />
        </div>
        <div className={styles.content}>
          <ProtocolList protocols={protocols} />
        </div>
      </div>
    </div>
  );
}