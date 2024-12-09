import { Event } from '~/types/FeedTypes';
import styles from './CompositionExplorerLayout.module.css';
import { FeedLog } from '~/components/FeedConsumerComponents/FeedLog/FeedLog';

interface CompositionExplorerLayoutProps {
  compositions: any[]; // TODO: Define proper type
  events: Event[];
}

export function CompositionExplorerLayout({ compositions, events }: CompositionExplorerLayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.feedLog}>
          <FeedLog events={events} />
        </div>
        <div className={styles.content}>
          <h2>Compositions</h2>
        </div>
      </div>
    </div>
  );
} 