import React, { useState } from 'react';
import styles from './CompositionCard.module.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface CompositionCardProps {
  composition: any; // Type this properly based on your data structure
}

export const CompositionCard: React.FC<CompositionCardProps> = ({ composition }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.title}>
          <span>{composition.composition.nl_description}</span>
          <span className={styles.probability}>
            {(composition.probability * 100).toFixed(1)}%
          </span>
        </div>
        <button className={styles.expandButton}>
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {isExpanded && (
        <div className={styles.details}>
          <div className={styles.protocols}>
            {composition.composition.protocols.map((protocol: any, index: number) => (
              <div key={protocol.id} className={styles.protocol}>
                <div className={styles.protocolHeader}>
                  <span className={styles.strategy}>
                    {protocol.strategy.strategy_name}
                  </span>
                  <div className={styles.types}>
                    <span className={styles.type}>{protocol.input_type}</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.type}>{protocol.output_type}</span>
                  </div>
                </div>
                <div className={styles.protocolDescription}>
                  {protocol.natural_language_description}
                </div>
                <code className={styles.protocolCode}>
                  {protocol.protocol_code}
                </code>
              </div>
            ))}
          </div>

          <div className={styles.params}>
            <h4>Parameters:</h4>
            {composition.params.map((param: any, index: number) => (
              <div key={index} className={styles.param}>
                <code>{JSON.stringify(param, null, 2)}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 