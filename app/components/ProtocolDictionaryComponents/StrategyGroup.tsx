import { Protocol } from '~/types/FeedTypes';
import styles from './StrategyGroup.module.css';
import ProtocolCard from './ProtocolCard';

interface StrategyGroupProps {
  strategyName: string;
  protocols: Protocol[];
  activeProtocolMode: boolean;
  addProtocolToChain: (protocol: Protocol) => void;
}

export default function StrategyGroup({ strategyName, protocols, activeProtocolMode, addProtocolToChain }: StrategyGroupProps) {
  return (
    <div className={styles.strategyGroup}>
      <h2 className={styles.strategyName}>{strategyName}</h2>
      <div className={styles.protocolGrid}>
        {protocols.map((protocol) => (
          <ProtocolCard 
            key={protocol.id} 
            protocol={protocol}
            activeProtocolMode={activeProtocolMode}
            addProtocolToChain={addProtocolToChain}
          />
        ))}
      </div>
    </div>
  );
}