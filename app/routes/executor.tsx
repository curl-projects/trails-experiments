import { Protocol, Event, ConnectionEvent } from '~/types/FeedTypes';
import { ExecutorLayout } from '~/components/ExecutorComponents/ExecutorLayout';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useEventContext } from '~/context/FeedEventContext';

export default function Executor() {
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
    };

    ws.current.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        setEvents((prevEvents) => [...prevEvents, response]);
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
      <ExecutorLayout />
    </div>
  );
}