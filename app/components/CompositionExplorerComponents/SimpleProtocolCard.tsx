import React from 'react';
import { Protocol } from '~/types/FeedTypes';
import styles from './SimpleProtocolCard.module.css';
import { useFeedContext } from '~/context/FeedContext';

interface SimpleProtocolCardProps {
    protocol: Protocol;
}

export function SimpleProtocolCard({ protocol }: SimpleProtocolCardProps) {
    const { getNodeTypeColors } = useFeedContext();
    return (
        <div className={styles.protocolCard}>
            <p className={styles.content}>
                ({protocol.strategy.strategy_name},
                <span className={styles.types}>
                    <span 
                        className={styles.type} 
                        style={{ 
                            backgroundColor: getNodeTypeColors(protocol.input_type).background,
                            color: getNodeTypeColors(protocol.input_type).text
                        }}> 
                        {protocol.input_type}
                    </span>
                    <span className={styles.arrow}>→</span>
                    <span 
                        className={styles.type} 
                        style={{ 
                            backgroundColor: getNodeTypeColors(protocol.output_type).background,
                            color: getNodeTypeColors(protocol.output_type).text
                        }}>
                        {protocol.output_type}
                    </span>
                </span>
                )
            </p>
        </div>
    );
}