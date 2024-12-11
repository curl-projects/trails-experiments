import { Event, ConnectionEvent, Protocol, ErrorEvent, DataEvent } from '~/types/FeedTypes';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useEventContext } from '~/context/FeedEventContext';
import { CompositionExplorerLayout } from "~/components/CompositionExplorerComponents/CompositionExplorerLayout/CompositionExplorerLayout"

export default function CompositionExplorer() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [executable, setExecutable] = useState<string | null>(null);
  const [pathData, setPathData] = useState<any>(null);

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
        const message = {
          type: 'get_protocols',
          data: {
            request_id: uuidv4()
          }
        };
        console.log('Sending message:', message);
        ws.current.send(JSON.stringify(message));

        const graphMessage = {
          type: 'get_graph',
          data: {
            request_id: uuidv4()
          }
        };
        console.log('Sending graph message:', graphMessage);
        ws.current.send(JSON.stringify(graphMessage));

      }
    };

    ws.current.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        console.log('Received response:', response);

        if (response.event_type === 'data' && response.data_type === 'executable') {
          console.log('Received executable:', response.data);
          const dataEvent: DataEvent = {
            id: uuidv4(),
            event_type: 'data',
            data_type: 'executable',
            data: response.data,
          };
          setEvents((prevEvents) => [...prevEvents, dataEvent]);
          setExecutable(response.data[0]);
        }

        else if (response.event_type === 'data' && response.data_type === 'protocols') {
          console.log('Received protocols:', response.data);

          const dataEvent: DataEvent = {
            id: uuidv4(),
            event_type: 'data',
            data_type: 'protocols',
            data: response.data,
          };
          setEvents((prevEvents) => [...prevEvents, dataEvent]);

          setProtocols(response.data);
        }
       
        else if (response.event_type === 'error') {
          const errorEvent: ErrorEvent = {
            id: uuidv4(),
            event_type: 'error',
            message: response.message,
            traceback: response.traceback,
          };
          setEvents((prevEvents) => [...prevEvents, errorEvent]);
        }
        else if(response.event_type === 'data' && response.data_type === 'graph'){
          console.log('Received graph:', response.data);
          const dataEvent: DataEvent = {
            id: uuidv4(),
            event_type: 'data',
            data_type: 'graph',
            data: response.data,
          };
          setEvents((prevEvents) => [...prevEvents, dataEvent]);
        }
        else if(response.event_type === 'data' && response.data_type === 'path_results'){
          console.log('Received path results:', response.data);
          const dataEvent: DataEvent = {
            id: uuidv4(),
            event_type: 'data',
            data_type: 'path_results',
            data: response.data,
          };
          setEvents((prevEvents) => [...prevEvents, dataEvent]);
          setPathData(response.data);
        }
        else{
          console.log("HI")
          console.error("Unknown event type:", response);
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
        protocols={protocols}
        events={events}
        executable={executable}
        setExecutable={setExecutable}
        pathData={pathData}
        ws={ws}
      />
    </div>
  );
}