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
  const { getNodeTitle, getNodeTypeColors, formatPathGroupTitle } = useFeedContext();
  const nodeType = rankedOutput.output.node.labels[0];
  const colors = getNodeTypeColors(nodeType);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.feedCard} onClick={toggleExpand}>
      <div className={styles.header}>
        <div className={styles.summary}>
          <div className={styles.titleContainer}>
            <h3 className={styles.title}>{getNodeTitle(rankedOutput.output.node)}</h3>
            <span 
              className={styles.nodeType}
              style={{ 
                backgroundColor: colors.background,
                color: colors.text 
              }}
            >
              {nodeType}
            </span>
          </div>
          <div className={styles.summaryScore}>
            Score: {rankedOutput.ranking_score.toFixed(3)}
            <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
              ▼
            </span>
          </div>
        </div>
      </div>

      <div className={styles.pathsContainer}>
        {Object.entries(rankedOutput.output.paths).map(([key, paths]) => {
          const { protocolString, description } = formatPathGroupTitle(key, rankedOutput.output.parameterized_compositions);
          return (
            <div key={key} className={styles.pathGroup}>
              <div className={styles.pathGroupHeader}>
                <div className={styles.pathGroupTitle}>{protocolString}</div>
                <div className={styles.pathGroupDescription}>{description}</div>
              </div>
              {paths.map((path, index) => (
                <Path key={index} path={path} />
              ))}
            </div>
          );
        })}
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