import React, { useEffect, useState } from 'react';
import { Event, NodeEvent, ErrorEvent, ConnectionEvent, TriggerEvent } from '~/types/FeedTypes';
import { Node } from '~/types/GraphTypes';
import { FaPlusCircle, FaEdit, FaExclamationCircle, FaPlug, FaBolt, FaUnlink, FaCheckCircle } from 'react-icons/fa';

import styles from './FeedLog.module.css';
import { useFeedContext } from '~/context/FeedContext';

interface ExpandableEventProps {
  event: Event;
}

interface ValidationEvent extends Event {
  event_type: 'validation';
  status: 'success';
  message: string;
  details?: Record<string, any>;
}

const ExpandableEvent: React.FC<ExpandableEventProps> = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getNodeTitle } = useFeedContext();

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.eventBox} onClick={toggleExpand}>
      {event.event_type === 'add' && <AddEvent 
                                        event={event as NodeEvent}
                                        isExpanded={isExpanded} 
                                        getNodeTitle={getNodeTitle}
                                        />}
      {event.event_type === 'update' && <UpdateEvent 
                                          event={event as NodeEvent} 
                                          isExpanded={isExpanded}
                                          getNodeTitle={getNodeTitle}
                                          />}
      {event.event_type === 'error' && <ErrorEventComponent 
                                          event={event as ErrorEvent} 
                                          isExpanded={isExpanded}
                                          getNodeTitle={getNodeTitle}
                                          />}
      {event.event_type === 'connection' && <ConnectionEventComponent 
                                          event={event as ConnectionEvent} 
                                          isExpanded={isExpanded}
                                          getNodeTitle={getNodeTitle}
                                          />}
      {event.event_type === 'trigger' && <TriggerEventComponent 
                                          event={event as TriggerEvent} 
                                          isExpanded={isExpanded}
                                          getNodeTitle={getNodeTitle}
                                          />}
      {event.event_type === 'validation' && <ValidationEventComponent 
                                          event={event as ValidationEvent} 
                                          isExpanded={isExpanded}
                                          />}
    </div>
  );
};

const AddEvent = ({ event, isExpanded, getNodeTitle }: { event: NodeEvent, isExpanded: boolean, getNodeTitle: (node: Node) => string }) => (
  <div className={styles.addEvent}>
    <div className={styles.eventContent}>
      <FaPlusCircle className={styles.eventIcon} style={{ color: '#28a745', fontSize: '1.8rem' }} />
      <span className={styles.nodeId}>{getNodeTitle(event.ranked_output?.output.node)}</span>
      <span className={styles.eventDetails}>New node added to feed</span>
    </div>
    {isExpanded && (
      <div className={styles.expandedDetails}>
        <p>Ranking Score: {event.ranked_output.ranking_score}</p>
        <p>Metadata: {JSON.stringify(event.ranked_output.output.metadata)}</p>
      </div>
    )}
  </div>
);

const UpdateEvent = ({ event, isExpanded, getNodeTitle }: { event: NodeEvent, isExpanded: boolean, getNodeTitle: (node: Node) => string }) => (
  <div className={styles.updateEvent}>
    <div className={styles.eventContent}>
      <FaEdit className={styles.eventIcon} />
      <span className={styles.nodeId}>{event.ranked_output?.output.node.id}</span>
      <span className={styles.eventDetails}>Node position updated</span>
    </div>
    {isExpanded && (
      <div className={styles.expandedDetails}>
        <p>Ranking Score: {event.ranked_output.ranking_score}</p>
        <p>Metadata: {JSON.stringify(event.ranked_output.output.metadata)}</p>
      </div>
    )}
  </div>
);

const ErrorEventComponent = ({ event, isExpanded, getNodeTitle }: { event: ErrorEvent, isExpanded: boolean, getNodeTitle: (node: Node) => string }) => (
  <div className={styles.errorEvent}>
    <div className={styles.eventContent}>
      <FaExclamationCircle className={styles.eventIcon} style={{ fontSize: "1.8rem" }} />
      <span className={styles.eventDetails}>{event.message}</span>
    </div>
    {isExpanded && event.traceback && (
      <div className={styles.expandedDetails}>
        <p>Traceback: {event.traceback}</p>
      </div>
    )}
  </div>
);

const ConnectionEventComponent = ({ event, isExpanded, getNodeTitle }: { event: ConnectionEvent, isExpanded: boolean, getNodeTitle: (node: Node) => string }) => (
  <div className={styles.connectionEvent}>
    <div className={styles.eventContent}>
      {event.status === 'connected' ? (
        <FaPlug className={styles.eventIcon} />
      ) : (
        <FaUnlink className={styles.eventIcon} />
      )}
      <span className={styles.eventDetails}>
        {event.status === 'connected' ? 'Connected to server' : 'Disconnected from server'} at {event.timestamp}
      </span>
    </div>
    {isExpanded && (
      <div className={styles.expandedDetails}>
        <p>Timestamp: {event.timestamp}</p>
      </div>
    )}
  </div>
);

const TriggerEventComponent = ({ event, isExpanded, getNodeTitle }: { event: TriggerEvent, isExpanded: boolean, getNodeTitle: (node: Node) => string }) => (
  <div className={styles.triggerEvent}>
    <div className={styles.eventContent}>
      <FaBolt className={styles.eventIcon} style={{ color: '#ffdd44' }} />
      <span className={styles.eventDetails}>
        Triggered action: {event.action} at {event.timestamp}
      </span>
    </div>
    {isExpanded && (
      <div className={styles.expandedDetails}>
        <p>Action: {event.action}</p>
        <p>Timestamp: {event.timestamp}</p>
      </div>
    )}
  </div>
);

function ValidationEventComponent({ event, isExpanded }: { event: ValidationEvent, isExpanded: boolean }) {
  return (
    <div className={styles.validationEvent}>
      <div className={styles.eventContent}>
        <FaCheckCircle className={styles.eventIcon} />
        <span className={styles.eventDetails}>{event.message}</span>
      </div>
      {isExpanded && event.details && (
        <div className={styles.expandedDetails}>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{JSON.stringify(event.details, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export function FeedLog({ events }: { events: Event[] }) {
  return (
    <div className={styles.feedLog}>
      <h3>Feed Event Log:</h3>
      <div className={styles.eventList}>
        {events.map((event, index) => (
          <div key={index} className={styles.eventWrapper}>
            <ExpandableEvent event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}