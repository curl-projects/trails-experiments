import React from 'react';
import styles from './Composition.module.css';

interface CompositionProps {
  description: string;
  strategyChain: string;
  parameters: string;
  paths: string[];
}

export const Composition: React.FC<CompositionProps> = ({ description, strategyChain, parameters, paths }) => {
  return (
    <div className={styles.composition}>
      <div className={styles.description}>{description}</div>
      <div className={styles.strategyChain}>{strategyChain}</div>
      <div className={styles.parameters}>{parameters}</div>
      <div className={styles.paths}>
        {paths.map((path, index) => (
          <div key={index} className={styles.path}>
            {path}
          </div>
        ))}
      </div>
    </div>
  );
};