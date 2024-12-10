import styles from './ExecutorLayout.module.css';
import { Event } from '~/types/FeedTypes';

interface OutputDisplayProps {
  events: Event[];
}

export function OutputDisplay({ events }: OutputDisplayProps) {
  return (
    <div className={styles.outputPanel}>
      {events.map((event, index) => (
        <div key={index}>
          {event.event_type === 'data' && (
            <pre>{JSON.stringify(event.data, null, 2)}</pre>
          )}
          {event.event_type === 'error' && (
            <div style={{ color: 'red' }}>
              Error: {event.message}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 