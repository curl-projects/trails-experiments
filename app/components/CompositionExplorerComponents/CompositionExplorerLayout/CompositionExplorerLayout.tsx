import { Event, Protocol } from '~/types/FeedTypes';
import styles from './CompositionExplorerLayout.module.css';
import { FeedLog } from '~/components/FeedConsumerComponents/FeedLog/FeedLog';
import { CompositionChain } from '../CompositionChain';
import ProtocolList from '~/components/ProtocolDictionaryComponents/ProtocolList';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CodeOutput } from '../CodeOutput';
import { OutputDisplay } from '~/components/ExecutorComponents/OutputDisplay';
import { Path } from '~/components/FeedConsumerComponents/FeedCard/feed-card-components/Path/Path';

interface CompositionExplorerLayoutProps {
  ws: React.RefObject<WebSocket | null> | null;
  events: Event[];
  protocols: Protocol[];
  executable: string | null;
  setExecutable: (executable: string) => void;
  pathData: any;
}

export function CompositionExplorerLayout({
  ws,
  events,
  protocols,
  executable,
  setExecutable,
  pathData,
}: CompositionExplorerLayoutProps) {
  const [availableProtocols, setAvailableProtocols] = useState<Protocol[]>(protocols);
  const [compositionChain, setCompositionChain] = useState<Protocol[]>([]);
  const [showNewView, setShowNewView] = useState<boolean>(false);
  const [activeTraversalPath, setActiveTraversalPath] = useState<any>(null);

  useEffect(() => {
    filterAvailableProtocols();
  }, [compositionChain, protocols]);

  useEffect(() => {
    console.log('Executable:', executable);
  }, [executable]);

  useEffect(() => {
    if (compositionChain.length > 0) {
      console.log('compositionChain', compositionChain);
      const message = {
        type: 'get_executable',
        data: {
          request_id: uuidv4(),
          composition_chain: compositionChain,
        },
      };
      console.log('Sending message:', message);
      ws?.current?.send(JSON.stringify(message));
    }
  }, [compositionChain]);

  function filterAvailableProtocols() {
    if (compositionChain.length === 0) {
      setAvailableProtocols(protocols);
    } else {
      const lastProtocol = compositionChain[compositionChain.length - 1];
      const filteredProtocols = protocols.filter(
        (protocol) => protocol.input_type === lastProtocol.output_type
      );
      setAvailableProtocols(filteredProtocols);
    }
  }

  function addProtocolToChain(protocol: Protocol) {
    setCompositionChain([...compositionChain, protocol]);
  }

  function toggleView() {
    setShowNewView(!showNewView);
  }
  return (
    <div className={`${styles.container} ${showNewView ? styles.newViewActive : ''}`}>
      <div className={styles.compositeDescription}>
        {compositionChain.length > 0 ? (
          <p>{compositionChain.map((protocol) => protocol.natural_language_description).join(' ')}</p>
        ) : (
          <p className={styles.compositeDescriptionPlaceholder}>
            <span>▼</span> Select an example or build your own
          </p>
        )}
      </div>
      <div className={styles.innerContainer}>
        {/* First View */}
        <div className={styles.view}>
          <div className={styles.protocolContainer}>
            <ProtocolList
              protocols={availableProtocols}
              activeProtocolMode={true}
              addProtocolToChain={addProtocolToChain}
            />
          </div>
          <div className={styles.compositionsContainer}>
            <CompositionChain
              compositionChain={compositionChain}
              setCompositionChain={setCompositionChain}
              setExecutable={setExecutable}
              showNewView={showNewView}
            />
            <CodeOutput
              executable={executable}
              showNewView={showNewView}
              setShowNewView={setShowNewView}
            />
          </div>
        </div>
        {/* Second View */}
        <div className={styles.view}>
          <div
            className={styles.compositionsContainer}
            style={{
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                maxHeight: '40vh',
                overflowY: 'auto',
              }}
            >
              <CompositionChain
                compositionChain={compositionChain}
                setCompositionChain={setCompositionChain}
                setExecutable={setExecutable}
                showNewView={showNewView}
              />
              <CodeOutput
                executable={executable}
                showNewView={showNewView}
                setShowNewView={setShowNewView}
              />
            </div>
            <div className={styles.pathContainer}>
              {pathData?.[0]?.paths &&
                Object.entries(pathData[0]?.paths).map(([key, paths]) => {
                  return (
                    <div key={key}>
                      {paths.map((path: any, index: number) => (
                        <div key={index} className={styles.pathWrapper}>
                          <Path path={path} />
                          <div className={styles.pathButton}>
                            <button onClick={() => setActiveTraversalPath({...path})}>Traverse Path</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
            </div>
          </div>
          <div className={styles.newView}>
            <OutputDisplay
              events={events}
              pathData={pathData}
              traversalPath={activeTraversalPath}
            />
          </div>
        </div>
      </div>
    </div>
  );
}