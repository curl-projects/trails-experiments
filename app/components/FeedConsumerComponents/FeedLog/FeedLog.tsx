import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { Event, NodeEvent, ErrorEvent, ConnectionEvent, TriggerEvent, ValidationEvent, DataEvent } from '~/types/FeedTypes';
import { Node } from '~/types/GraphTypes';
import { FaPlus, FaPencilAlt, FaExclamationCircle, FaPlug, FaBolt, FaUnlink, FaCheckCircle, FaDatabase } from 'react-icons/fa';
import { useFeedContext } from '~/context/FeedContext';

import styles from './FeedLog.module.css';

interface FeedLogProps {
  events: Event[];
}

interface ExpandableEventProps {
  event: Event;
}

const ExpandableEvent: React.FC<ExpandableEventProps> = ({
  event,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.eventBox} onClick={toggleExpand}>
      {event.event_type === 'add' && <AddEvent 
                                        event={event as NodeEvent}
                                        isExpanded={isExpanded} 
                                        />}
      {event.event_type === 'update' && <UpdateEvent 
                                          event={event as NodeEvent} 
                                          isExpanded={isExpanded}
                                          />}
      {event.event_type === 'error' && <ErrorEventComponent 
                                          event={event as ErrorEvent} 
                                          isExpanded={isExpanded}
                                          />}
      {event.event_type === 'connection' && <ConnectionEventComponent 
                                          event={event as ConnectionEvent} 
                                          isExpanded={isExpanded}
                                          />}
      {event.event_type === 'trigger' && <TriggerEventComponent 
                                          event={event as TriggerEvent} 
                                          isExpanded={isExpanded}
                                          />}
      {event.event_type === 'validation' && <ValidationEventComponent 
                                          event={event as ValidationEvent} 
                                          isExpanded={isExpanded}
                                          />}
      {event.event_type === 'data' && (
        <DataEventComponent event={event as DataEvent} isExpanded={isExpanded} />
      )}
    </div>
  );
};

const AddEvent = ({
  event,
  isExpanded,
}: {
  event: NodeEvent;
  isExpanded: boolean;
}) => {
  const { getNodeTitle, getNodeTypeColors } = useFeedContext();

  const node = event.ranked_output?.output.node;
  const colors = getNodeTypeColors(node.labels[0]);

  return (
    <div className={styles.addEvent}>
      <div className={styles.eventContent}>
        <FaPlus className={styles.eventIcon} style={{ color: 'purple', fontSize: '1.5rem' }} />
        <span className={styles.eventDetails}>
          <span className={styles.nodeValue} style={{ backgroundColor: colors.background, color: colors.text }}>
            {getNodeTitle(node)}
          </span>{' '}
          added to feed
        </span>
      </div>
      {isExpanded && (
        <div className={styles.expandedDetails}>
          <p>Ranking Score: {event.ranked_output.ranking_score}</p>
          <p>Metadata: {JSON.stringify(event.ranked_output.output.metadata)}</p>
        </div>
      )}
    </div>
  );
};

const UpdateEvent = ({
  event,
  isExpanded,
}: {
  event: NodeEvent;
  isExpanded: boolean;
}) => {
  const { getNodeTitle, getNodeTypeColors } = useFeedContext();

  const node = event.ranked_output?.output.node;
  const colors = getNodeTypeColors(node.labels[0]);

  return (
    <div className={styles.updateEvent}>
      <div className={styles.eventContent}>
        <FaPencilAlt className={styles.eventIcon} style={{ fontSize: '1.3rem', color: 'purple' }} />
        <span className={styles.eventDetails}>
          <span className={styles.nodeValue} style={{ backgroundColor: colors.background, color: colors.text }}>
            {getNodeTitle(node)}
          </span> node updated
        </span>
      </div>
      {isExpanded && (
        <div className={styles.expandedDetails}>
          <p>Ranking Score: {event.ranked_output.ranking_score}</p>
          <p>Metadata: {JSON.stringify(event.ranked_output.output.metadata)}</p>
        </div>
      )}
    </div>
  );
};

const ErrorEventComponent = ({
  event,
  isExpanded,
}: {
  event: ErrorEvent;
  isExpanded: boolean;
}) => (
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

const ConnectionEventComponent = ({
  event,
  isExpanded,
}: {
  event: ConnectionEvent;
  isExpanded: boolean;
}) => (
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

const TriggerEventComponent = ({
  event,
  isExpanded,
}: {
  event: TriggerEvent;
  isExpanded: boolean;
}) => (
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

function ValidationEventComponent({
  event,
  isExpanded,
}: {
  event: ValidationEvent;
  isExpanded: boolean;
}) {
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

const DataEventComponent = ({
  event,
  isExpanded,
}: {
  event: DataEvent;
  isExpanded: boolean;
}) => (
  <div className={styles.dataEvent}>
    <div className={styles.eventContent}>
      <FaDatabase className={styles.eventIcon} />
      <span className={styles.eventDetails}>Received data event</span>
    </div>
    {isExpanded && (
      <div className={styles.expandedDetails}>
        <pre>{JSON.stringify(event.data, null, 2)}</pre>
      </div>
    )}
  </div>
);

export function FeedLog({ events }: FeedLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Draggable handle={`.${styles.feedLogTitle}`}>
      <div className={styles.feedLogContainer}>
        <h3 className={styles.feedLogTitle} onClick={toggleExpand}>
          Feed Event Log
        </h3>
        {isExpanded && (
          <div className={styles.eventList}>
            {events.map((event, index) => (
              <div key={index} className={styles.eventWrapper}>
                <ExpandableEvent event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Draggable>
  );
}