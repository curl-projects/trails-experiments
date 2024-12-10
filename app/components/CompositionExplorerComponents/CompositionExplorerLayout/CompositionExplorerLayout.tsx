import { Event, Protocol } from '~/types/FeedTypes';
import styles from './CompositionExplorerLayout.module.css';
import { FeedLog } from '~/components/FeedConsumerComponents/FeedLog/FeedLog';
import { CompositionChain } from '../CompositionChain';
import ProtocolList from '~/components/ProtocolDictionaryComponents/ProtocolList';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CodeOutput } from '../CodeOutput';

interface CompositionExplorerLayoutProps {
  ws: React.RefObject<WebSocket | null> | null;
  events: Event[];
  protocols: Protocol[];
  executable: string | null;
  setExecutable: (executable: string) => void;
}

export function CompositionExplorerLayout({
  ws,
  events,
  protocols,
  executable,
  setExecutable,
}: CompositionExplorerLayoutProps) {
  const [availableProtocols, setAvailableProtocols] = useState<Protocol[]>(protocols);
  const [compositionChain, setCompositionChain] = useState<Protocol[]>([]);

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

  return (
    <div className={styles.container}>
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
          />
          <CodeOutput executable={executable} />
        </div>
        <FeedLog events={events} />
      </div>
    </div>
  );
}