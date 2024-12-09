import { Protocol } from '~/types/FeedTypes';
import styles from './StrategyGroup.module.css';
import ProtocolCard from './ProtocolCard';

interface StrategyGroupProps {
  strategyName: string;
  protocols: Protocol[];
}

export default function StrategyGroup({ strategyName, protocols }: StrategyGroupProps) {
  return (
    <div className={styles.strategyGroup}>
      <h2 className={styles.strategyName}>{strategyName}</h2>
      <div className={styles.protocolGrid}>
        {protocols.map((protocol) => (
          <ProtocolCard key={protocol.id} protocol={protocol} />
        ))}
      </div>
    </div>
  );
}