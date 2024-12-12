import { useState } from 'react';
import { Protocol } from '~/types/FeedTypes';
import styles from './ProtocolCard.module.css';
import { useFeedContext } from '~/context/FeedContext';

interface ProtocolCardProps {
  protocol: Protocol;
  activeProtocolMode: boolean;
  addProtocolToChain: (protocol: Protocol) => void;
}

export default function ProtocolCard({ protocol, activeProtocolMode, addProtocolToChain }: ProtocolCardProps) {
  const { getNodeTypeColors } = useFeedContext();
  const [isExpanded, setIsExpanded] = useState(false);
  
  function handleClick() {
    if (activeProtocolMode) {
      addProtocolToChain(protocol);
    } else {
      setIsExpanded(!isExpanded);
    }
  }

  return (
    <div 
      className={styles.protocolCard} 
      onClick={handleClick}
      style={{
        height: isExpanded ? 'auto' : '120px',
        maxWidth: activeProtocolMode ? '250px' : '300px'
      }}
    >
      <div className={styles.header}>
        <div className={styles.types}>
          <span className={styles.type} style={{ color: getNodeTypeColors(protocol.input_type).text, backgroundColor: getNodeTypeColors(protocol.input_type).background }}>{protocol.input_type}</span>
          <span className={styles.arrow}>→</span>
          <span className={styles.type} style={{ color: getNodeTypeColors(protocol.output_type).text, backgroundColor: getNodeTypeColors(protocol.output_type).background }}>{protocol.output_type}</span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.nlDescriptionContainer}>
          <p className={styles.nlDescription}>{protocol.natural_language_description}</p>
        </div>
        {isExpanded && (
          <div className={styles.codeBlock}>
            <pre className={styles.code}>
              {protocol.protocol_code}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 