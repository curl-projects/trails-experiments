import React, { useState } from 'react';
import { RankedOutput } from '~/types/FeedTypes';
import styles from './FeedCard.module.css';

interface FeedCardProps {
  rankedOutput: RankedOutput;
}

export function FeedCard({ rankedOutput }: FeedCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { output, ranking_score = 0, sub_scores = {} } = rankedOutput;
  const { node, compositions = {}, metadata = {} } = output;


  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.feedCard} onClick={toggleExpand}>
      <div className={styles.header}>
        <div className={styles.summary}>
          <h3 className={styles.title}>Node ID: {node.id}</h3>
          <div className={styles.summaryScore}>
            Score: {ranking_score.toFixed(3)}
            <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
              ▼
            </span>
          </div>
        </div>
        <div className={styles.labels}>
          {node.labels.map((label) => (
            <span key={label} className={styles.label}>
              {label}
            </span>
          ))}
        </div>
        {!isExpanded && (
          <div className={styles.preview}>
            {Object.keys(node.properties).length} properties, 
            {Object.keys(sub_scores).length} sub-scores
          </div>
        )}
      </div>

      <div className={isExpanded ? styles.expandedContent : styles.collapsedContent}>
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Node Properties</h4>
          <pre className={styles.pre}>{JSON.stringify(node.properties, null, 2)}</pre>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Sub-scores:</h4>
          <ul className={styles.scoreList}>
            {Object.entries(sub_scores).map(([category, score]) => (
              <li key={category} className={styles.scoreItem}>
                <span className={styles.scoreLabel}>{category}</span>
                <span className={styles.scoreValue}>{score.toFixed(3)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Metadata</h4>
          <pre className={styles.pre}>{JSON.stringify(metadata, null, 2)}</pre>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Compositions</h4>
          <pre className={styles.pre}>{JSON.stringify(compositions, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}