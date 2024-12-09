import { Event, Protocol } from '~/types/FeedTypes';
import styles from './CompositionExplorerLayout.module.css';
import { FeedLog } from '~/components/FeedConsumerComponents/FeedLog/FeedLog';
import { CompositionChain } from '../CompositionChain';
import ProtocolList from '~/components/ProtocolDictionaryComponents/ProtocolList';
import { useState, useEffect } from 'react';

interface CompositionExplorerLayoutProps {
//   compositions: any[]; // TODO: Define proper type
  events: Event[];
  protocols: Protocol[];
}

export function CompositionExplorerLayout({ events, protocols }: CompositionExplorerLayoutProps) {
  const [availableProtocols, setAvailableProtocols] = useState<Protocol[]>(protocols);
  const [compositionChain, setCompositionChain] = useState<Protocol[]>([]);

  useEffect(() => {
    filterAvailableProtocols();
  }, [compositionChain, protocols]);

  function filterAvailableProtocols() {
    if (compositionChain.length === 0) {
        // All protocols are available at the start
        setAvailableProtocols(protocols);
      } else {
        // Filter protocols based on the output type of the last protocol in the chain
        const lastProtocol = compositionChain[compositionChain.length - 1];
        const filteredProtocols = protocols.filter(
          (protocol) => protocol.input_type === lastProtocol.output_type
        );
        setAvailableProtocols(filteredProtocols);
      }
  }

  function addProtocolToChain(protocol: Protocol) {
    setCompositionChain([...compositionChain, protocol]);
  };

  return (
    <div className={styles.container}>
        <div className={styles.compositeDescription}>
            {compositionChain.length > 0 ? 
                <p>
                    {compositionChain.map((protocol) => protocol.natural_language_description).join(' ')}
                </p>
                :
                <p className={styles.compositeDescriptionPlaceholder}>
                    <span>▼</span> Select an example or build your own 
                </p>
            }
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
        <CompositionChain compositionChain={compositionChain} />
        <div className={styles.codeOutputContainer}>
            
        </div>
      </div>
      <FeedLog events={events} />
    </div>
    </div>
  );
}