import { Protocol } from '~/types/FeedTypes';
import styles from './ProtocolList.module.css';
import StrategyGroup from './StrategyGroup';
import { useState } from 'react';

interface ProtocolListProps {
  protocols: Protocol[];
}

export default function ProtocolList({ protocols }: ProtocolListProps) {
  console.log('protocols', protocols);
  // Group protocols by strategy
  const groupedProtocols = protocols.reduce((acc, protocol) => {
    const strategyName = protocol.strategy.strategy_name;
    if (!acc[strategyName]) {
      acc[strategyName] = [];
    }
    acc[strategyName].push(protocol);
    return acc;
  }, {} as Record<string, Protocol[]>);

  return (
    <div className={styles.protocolList}>
      {Object.entries(groupedProtocols).map(([strategyName, protocols]) => (
        <StrategyGroup 
          key={strategyName}
          strategyName={strategyName}
          protocols={protocols}
        />
      ))}
    </div>
  );
} 