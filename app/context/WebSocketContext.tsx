// trails-experiments/app/context/WebSocketContext.tsx
import React, { createContext, useContext, useEffect, useRef } from 'react';

interface WebSocketContextProps {
  sendMessage: (message: any) => void;
  addMessageListener: (listener: (event: MessageEvent) => void) => void;
  removeMessageListener: (listener: (event: MessageEvent) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextProps | null>(null);

export const WebSocketProvider: React.FC = ({ children }) => {
  const ws = useRef<WebSocket | null>(null);
  const listeners = useRef<Set<(event: MessageEvent) => void>>(new Set());

  useEffect(() => {
    ws.current = new WebSocket('ws://127.0.0.1:6789');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.current.onmessage = (event) => {
      listeners.current.forEach((listener) => listener(event));
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = (message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open.');
    }
  };

  const addMessageListener = (listener: (event: MessageEvent) => void) => {
    listeners.current.add(listener);
  };

  const removeMessageListener = (listener: (event: MessageEvent) => void) => {
    listeners.current.delete(listener);
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, addMessageListener, removeMessageListener }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};