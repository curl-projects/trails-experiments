import React from 'react';
import { Path as PathType } from '~/types/FeedTypes';
import styles from './Path.module.css';
import { useFeedContext } from '~/context/FeedContext';

interface PathProps {
  path: PathType;
}

export function Path({ path }: PathProps) {
  const { getNodeTitle, getNodeTypeColors } = useFeedContext();

  return (
    <div className={styles.path}>
      {path.nodes.map((node, index) => {
        const colors = getNodeTypeColors(node.labels[0]);
        const relationship = index < path.nodes.length - 1 ? path.relationships[index] : null;
        const isReverse = relationship && relationship.end_node_id === node.id;

        return (
          <React.Fragment key={`path_${index}`}>
            <div className={styles.node}>
              <span className={styles.nodeContent}>
                <span className={styles.nodeValue}>
                  {getNodeTitle(node)}
                </span>
                <span 
                  className={styles.nodeType}
                  style={{ 
                    backgroundColor: colors.background,
                    color: colors.text 
                  }}
                >
                  {node.labels[0]}
                </span>
              </span>
            </div>

            {relationship && (
              <div className={styles.relationship}>
                {isReverse ? (
                  <>
                    <span className={styles.arrow}>←</span>
                    <span className={styles.relationshipType}>
                      {relationship.type}
                    </span>
                    <span className={styles.line}>─</span>
                  </>
                ) : (
                  <>
                    <span className={styles.line}>─</span>
                    <span className={styles.relationshipType}>
                      {relationship.type}
                    </span>
                    <span className={styles.arrow}>→</span>
                  </>
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}