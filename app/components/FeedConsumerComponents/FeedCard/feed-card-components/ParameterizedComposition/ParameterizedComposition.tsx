import React from 'react';
import styles from './ParameterizedComposition.module.css';
import { ParameterizedComposition as ParameterizedCompositionType } from '~/types/FeedTypes';

interface ParameterizedCompositionProps {
  parameterized_composition: ParameterizedCompositionType;
}

export function ParameterizedComposition({ parameterized_composition }: ParameterizedCompositionProps) {
  return (
    <div className={styles.composition}>
      <div className={styles.description}>{parameterized_composition.composition.nl_description}</div>
      <div className={styles.protocols}>
        {parameterized_composition.composition.protocols.map((protocol, index) => (
          <div key={index} className={styles.protocol}>
            <div className={styles.strategy}>{protocol.strategy.strategy_name}</div>
            <div className={styles.types}>
              {protocol.input_type} → {protocol.output_type}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};