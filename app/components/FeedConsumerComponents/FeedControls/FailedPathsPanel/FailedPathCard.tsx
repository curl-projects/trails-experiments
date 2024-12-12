import React, { useState } from 'react';
import styles from './FailedPathCard.module.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FailedPathCardProps {
  failedPath: {
    id: string;
    message: string;
    traceback: string;
    timestamp: string;
    details?: {
      composition_id?: string;
      input_node_id?: string;
      input_type?: string;
      path_segments?: Record<string, any>;
    };
  };
}

export const FailedPathCard: React.FC<FailedPathCardProps> = ({ failedPath }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.title}>
          <span className={styles.message}>{failedPath.message}</span>
          <span className={styles.timestamp}>
            {new Date(failedPath.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <button className={styles.expandButton}>
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {isExpanded && (
        <div className={styles.details}>
          {failedPath.details && (
            <div className={styles.metadata}>
              <div className={styles.metadataItem}>
                <span className={styles.label}>Input Type:</span>
                <span className={styles.value}>{failedPath.details.input_type}</span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.label}>Input Node:</span>
                <span className={styles.value}>{failedPath.details.input_node_id}</span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.label}>Composition:</span>
                <span className={styles.value}>{failedPath.details.composition_id}</span>
              </div>
            </div>
          )}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Path Segments Found:</h4>
            <pre className={styles.traceback}>
              {failedPath.traceback}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}; 