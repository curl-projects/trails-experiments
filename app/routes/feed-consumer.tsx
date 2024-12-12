// app/routes/feed-consumer.tsx
import React, { useEffect, useState, useRef } from 'react';
import { ConnectionEvent, Event, TriggerEvent, ErrorEvent, DataEvent } from '~/types/FeedTypes';
import { FeedControls } from '~/components/FeedConsumerComponents/FeedControls/FeedControls';
import { useEventContext } from '~/context/FeedEventContext';
import { v4 as uuidv4 } from 'uuid';
import { eventSchema } from '~/types/RuntimeFeedSchemas';
import { FeedConsumerLayout } from '~/components/FeedConsumerComponents/FeedConsumerLayout';

export default function FeedConsumer() {
  const { events, setEvents } = useEventContext();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://127.0.0.1:6789');

    ws.current.onopen = () => {
      console.log('Connected to the WebSocket server');
      const connectionEvent: ConnectionEvent = {
        id: uuidv4(),
        event_type: 'connection',
        status: 'connected',
        timestamp: new Date().toISOString(),
      };
      setEvents((prevEvents) => [...prevEvents, connectionEvent]);

      // Request initial graph data
      if (ws.current?.readyState === WebSocket.OPEN) {
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
        const data: Event = JSON.parse(event.data);
        console.log('New event received:', data);
        
        if (data.event_type === 'data' && data.data_type === 'graph') {
          console.log('Received graph:', data.data);
          const dataEvent: DataEvent = {
            id: uuidv4(),
            event_type: 'data',
            data_type: 'graph',
            data: data.data,
          };
          setEvents((prevEvents) => [...prevEvents, dataEvent]);
          return;
        }

        if (data.event_type === 'data' && data.data_type === 'debug_record') {
          console.warn('Received debug record:', data.data);
          
          // Create a data event from the debug record
          const debugEvent: DataEvent = {
            id: uuidv4(),
            event_type: 'data',
            data_type: 'debug_record',
            data: data.data.path_segments || {},
            message: `Failed path in composition: ${data.data.composition_description || 'Unknown composition'}`,
            timestamp: new Date().toISOString(),
            details: {
              composition_id: data.data.composition_id,
              input_node_id: data.data.input_node_id,
              input_type: data.data.input_type,
              path_segments: data.data.path_segments
            }
          };

          setEvents((prevEvents) => [...prevEvents, debugEvent]);
          return;
        }

        const parsedEvent = eventSchema.safeParse(data);
        if(!parsedEvent.success) {
          console.log('Invalid event:', data);
          console.error('Invalid event:', parsedEvent.error);

          const errorEvent: ErrorEvent = {
            id: uuidv4(),
            event_type: 'error',
            message: 'Failed to parse event',
            traceback: JSON.stringify(parsedEvent.error.issues, null, 2),
          };
    
          setEvents((prevEvents) => [...prevEvents, errorEvent]);
          return;
        }

        const validEvent: Event = parsedEvent.data as Event;
        setEvents((prevEvents) => [...prevEvents, validEvent]);

      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
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
  }, []); // Added empty dependency array

  const handleTriggerSearch = (searchParams: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'search',
        data: searchParams,
      };
      console.log('Sending message:', message);
      ws.current.send(JSON.stringify(message));

      const triggerEvent: TriggerEvent = {
        id: uuidv4(),
        event_type: 'trigger',
        action: 'search',
        timestamp: new Date().toISOString(),
      };
      setEvents((prevEvents) => [...prevEvents, triggerEvent]);

    } else {
      console.error('WebSocket is not open.');
    }
  };

  return (
    <div>
      <FeedConsumerLayout events={events} onTriggerSearch={handleTriggerSearch} />
    </div>
  );
}