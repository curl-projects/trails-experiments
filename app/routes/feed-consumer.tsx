// app/routes/feed-consumer.tsx
import React, { useEffect, useState, useRef } from 'react';
import { ConnectionEvent, Event, TriggerEvent, ErrorEvent } from '~/types/FeedTypes';
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
    };

    ws.current.onmessage = (event) => {
      try {
        const data: Event = JSON.parse(event.data);
        console.log('New event received:', data);
        const parsedEvent = eventSchema.safeParse(data);
        if(!parsedEvent.success) {
          console.log('Invalid event:', data);
          console.error('Invalid event:', parsedEvent.error);

          const errorEvent: ErrorEvent = {
            id: uuidv4(), // Generate a unique ID for the error event
            event_type: 'error',
            message: 'Failed to parse event',
            traceback: JSON.stringify(parsedEvent.error.issues, null, 2), // Format error details with indentation 
          };
    
          // Push the error event to the log
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
      <FeedControls onTriggerSearch={handleTriggerSearch} />
      <FeedConsumerLayout events={events} />
    </div>
  );
}