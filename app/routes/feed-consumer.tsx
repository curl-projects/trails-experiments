// app/routes/feed-consumer.tsx
import React, { useEffect, useState, useRef } from 'react';
import { ConnectionEvent, Event, TriggerEvent } from '~/types/FeedTypes';
import { FeedContainer } from '~/components/FeedContainer/FeedContainer';
import { FeedControls } from '~/components/FeedControls/FeedControls';
import { useEventContext } from '~/context/FeedEventContext';

export default function FeedConsumer() {
  const { events, setEvents } = useEventContext();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://127.0.0.1:6789');

    ws.current.onopen = () => {
      console.log('Connected to the WebSocket server');
      const connectionEvent: ConnectionEvent = {
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
        setEvents((prevEvents) => [...prevEvents, data]);
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
      <FeedContainer events={events} />
    </div>
  );
}