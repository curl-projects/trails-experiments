import React from 'react';
import { Path as PathType } from '~/types/FeedTypes';
import styles from './Path.module.css';
import { useFeedContext } from '~/context/FeedContext';
import { usePathHighlight } from '~/context/PathHighlightContext';
import { FaThumbtack } from 'react-icons/fa';

interface PathProps {
  path: PathType;
}

export function Path({ path }: PathProps) {
  const { getNodeTitle, getNodeTypeColors } = useFeedContext();
  const { setHighlightedPath, togglePinnedPath, pinnedPaths } = usePathHighlight();
  
  const pathKey = path.nodes.map(n => n.properties.id).join('-');
  const isPinned = pinnedPaths.some(p => 
    p.nodes.map(n => n.properties.id).join('-') === pathKey
  );

  return (
    <div className={styles.pathContainer}>
      <div 
        className={styles.path}
        onMouseEnter={() => setHighlightedPath(path)}
        onMouseLeave={() => setHighlightedPath(null)}
      >
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
      <button 
        className={`${styles.pinButton} ${isPinned ? styles.pinned : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          togglePinnedPath(path);
        }}
        title={isPinned ? "Unpin path" : "Pin path"}
      >
        <FaThumbtack className={styles.pinIcon} />
      </button>
    </div>
  );
}