import React from 'react';
import { Protocol } from '~/types/FeedTypes';
import { SimpleProtocolCard } from './SimpleProtocolCard';
import styles from './CompositionChain.module.css';

interface CompositionChainProps {
  compositionChain: Protocol[];
  setCompositionChain: (chain: Protocol[]) => void;
  setExecutable: (executable: string) => void;
}

export function CompositionChain({ compositionChain, setCompositionChain, setExecutable }: CompositionChainProps) {
  return (
    <div className={styles.compositionChain}>
      {compositionChain.length > 0 && <h3 className={styles.resetChain} onClick={() => {
        setCompositionChain([]);
        setExecutable('');
      }}>Reset Chain</h3>}
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