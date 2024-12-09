import { Event, ConnectionEvent } from '~/types/FeedTypes';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useEventContext } from '~/context/FeedEventContext';
import { CompositionExplorerLayout } from "~/components/CompositionExplorerComponents/CompositionExplorerLayout/CompositionExplorerLayout"

export default function CompositionExplorer() {
  const [compositions, setCompositions] = useState<any[]>([]); // TODO: Define proper type
  const { events, setEvents } = useEventContext();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    setEvents([]);
    ws.current = new WebSocket('ws://127.0.0.1:6789');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket server');
      const connectionEvent: ConnectionEvent = {
        id: uuidv4(),
        event_type: 'connection',
        status: 'connected',
        timestamp: new Date().toISOString(),
      };
      setEvents((prevEvents) => [...prevEvents, connectionEvent]);

      // Request compositions when connection is established
      if (ws.current?.readyState === WebSocket.OPEN) {
        // const message = {
        //   type: 'get_compositions',
        //   data: {
        //     request_id: uuidv4()
        //   }
        // };
        // console.log('Sending message:', message);
        // ws.current.send(JSON.stringify(message));
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        console.log('Received response:', response);
        setEvents((prevEvents) => [...prevEvents, response]);

        if (response.event_type === 'data') {
          console.log('Received compositions:', response.data);
          setCompositions(response.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
      const disconnectionEvent: ConnectionEvent = {
        id: uuidv4(),
        event_type: 'connection',
        status: 'disconnected',
        timestamp: new Date().toISOString(),
      };
      setEvents((prevEvents) => [...prevEvents, disconnectionEvent]);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <div>
      <CompositionExplorerLayout 
        compositions={compositions}
        events={events}
      />
    </div>
  );
}