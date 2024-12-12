import React, { useEffect, useState } from 'react';
import styles from './ProtocolsPanel.module.css';
import { Protocol } from '~/types/FeedTypes';
import { v4 as uuidv4 } from 'uuid';
import ProtocolList from './ProtocolList';

export const ProtocolsPanel: React.FC = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:6789');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      // Request protocols when connection is established
      if (ws.readyState === WebSocket.OPEN) {
        const message = {
          type: 'get_protocols',
          data: {
            request_id: uuidv4()
          }
        };
        console.log('Sending message:', message);
        ws.send(JSON.stringify(message));
      }
    };

    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        console.log('Received response:', response);

        if (response.event_type === 'data') {
          console.log('Received protocols:', response.data);
          setProtocols(response.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className={styles.panel}>
      <ProtocolList 
        protocols={protocols}
        activeProtocolMode={false}
        addProtocolToChain={() => {}}
      />
    </div>
  );
}; 