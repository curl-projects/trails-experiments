import React from 'react';
import { Protocol } from '~/types/FeedTypes';
import { SimpleProtocolCard } from './SimpleProtocolCard';
import styles from './CompositionChain.module.css';

interface CompositionChainProps {
  compositionChain: Protocol[];
}

export function CompositionChain({ compositionChain }: CompositionChainProps) {
  return (
    <div className={styles.compositionChain}>
      <h3>Composition Chain</h3>
      <div className={styles.chainList}>
        {compositionChain.map((protocol, index) => (
          <div key={index} className={styles.protocolCardContainer}>
            <SimpleProtocolCard protocol={protocol} />
          </div>
        ))}
      </div>
    </div>
  );
}