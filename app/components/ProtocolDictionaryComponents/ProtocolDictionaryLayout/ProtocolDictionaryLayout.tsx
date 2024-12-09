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
          <ProtocolList protocols={protocols} />
      </div>
      <FeedLog events={events} />
    </div>
  );
}