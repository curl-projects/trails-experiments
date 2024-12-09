import React from 'react';
import { Link } from '@remix-run/react';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <nav>
        <ul>
          
          <li><Link to="/protocol-dictionary">Protocol Dictionary</Link></li>
          <li><Link to="/composition-explorer">Composition Explorer</Link></li>
          <li><Link to="/feed-consumer">Feed Generator</Link></li>
        </ul>
      </nav>
    </header>
  );
}