// trails-experiments/app/context/EventContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Event, NodeEvent } from '~/types/FeedTypes';

interface EventContextType {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const nodeMap = new Map<string, NodeEvent>();


  return (
    <EventContext.Provider value={{ events, setEvents,  }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};