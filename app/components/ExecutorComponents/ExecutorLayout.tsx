import { useEffect, useState } from 'react';
import styles from './ExecutorLayout.module.css';
import { CodeInput } from './CodeInput';
import { OutputDisplay } from './OutputDisplay';
import { useEventContext } from '~/context/FeedEventContext';

export function ExecutorLayout() {
  const { events, setEvents } = useEventContext();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const websocket = new WebSocket('ws://127.0.0.1:6789');
    
    websocket.onopen = () => {
      setIsConnected(true);
      setWs(websocket);
    };

    websocket.onclose = () => {
      setIsConnected(false);
      setWs(null);
    };

    return () => {
      websocket.close();
    };
  }, []);

  const handleExecute = (code: string, inputNode: string) => {
    if (ws && isConnected) {
      const message = {
        type: 'execute',
        data: {
          code: code,
          input_node: inputNode
        }
      };
      ws.send(JSON.stringify(message));
    }
  };

  return (
    <div className={styles.container}>
      <CodeInput onExecute={handleExecute} isConnected={isConnected} />
      <OutputDisplay events={events} />
    </div>
  );
}