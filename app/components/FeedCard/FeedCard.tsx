import React, { useState } from 'react';
import { Path as PathType, RankedOutput } from '~/types/FeedTypes';
import styles from './FeedCard.module.css';
import { useFeedContext } from '~/context/FeedContext';
import { ParameterizedComposition } from './feed-card-components/ParameterizedComposition/ParameterizedComposition';
import { Path } from './feed-card-components/Path/Path';
interface FeedCardProps {
  rankedOutput: RankedOutput;
}


export function FeedCard({ rankedOutput }: FeedCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getNodeTitle } = useFeedContext();

  // Ensure compositions is an array of CompositionData

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.feedCard} onClick={toggleExpand}>
      <div className={styles.header}>
        <div className={styles.summary}>
          <h3 className={styles.title}>{getNodeTitle(rankedOutput.output.node)}</h3>
          <div className={styles.summaryScore}>
            Score: {rankedOutput.ranking_score.toFixed(3)}
            <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
              ▼
            </span>
          </div>
        </div>
        <div className={styles.labels}>
          {rankedOutput.output.node.labels.map((label) => (
            <span key={label} className={styles.label}>
              {label}
            </span>
          ))}
        </div>
        {!isExpanded && (
          <div className={styles.preview}>
            {Object.keys(rankedOutput.output.node.properties).length} properties, 
            {Object.keys(rankedOutput.ranking_scores).length} sub-scores
          </div>
        )}
      </div>

      <div className={isExpanded ? styles.expandedContent : styles.collapsedContent}>
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Node Properties</h4>
          <pre className={styles.pre}>{JSON.stringify(rankedOutput.output.node.properties, null, 2)}</pre>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Sub-scores:</h4>
          <ul className={styles.scoreList}>
            {Object.entries(rankedOutput.ranking_scores).map(([category, score]) => (
              <li key={category} className={styles.scoreItem}>
                <span className={styles.scoreLabel}>{category}</span>
                <span className={styles.scoreValue}>{score.toFixed(3)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Metadata</h4>
          <pre className={styles.pre}>{JSON.stringify(rankedOutput.output.metadata, null, 2)}</pre>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Compositions</h4>
          {rankedOutput.output.parameterized_compositions.map((parameterizedComposition, index) => (
            <ParameterizedComposition
              key={index}
              parameterized_composition={parameterizedComposition}
            /> 
          ))}

        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Paths</h4>
          <div className={styles.pathsContainer}>
            {Object.entries(rankedOutput.output.paths).map(([key, paths]) => (
              <div key={key} className={styles.pathGroup}>
                <div className={styles.pathGroupTitle}>{key}</div>
                {paths.map((path, index) => (
                  <Path key={index} path={path} />
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// NAME

// COMPOSITION

// PATHS