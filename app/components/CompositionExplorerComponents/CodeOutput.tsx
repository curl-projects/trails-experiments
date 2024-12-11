import { useState, useEffect } from 'react';
import styles from './CodeOutput.module.css';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

interface CodeOutputProps {
  executable: string | null;
  showNewView: boolean;
  setShowNewView: (showNewView: boolean) => void;
}

export function CodeOutput({ executable, showNewView, setShowNewView }: CodeOutputProps) {
  const [displayedExecutable, setDisplayedExecutable] = useState('');

  useEffect(() => {
    setDisplayedExecutable(executable || '');
  }, [executable]);

  return (
    <div className={styles.codeOutputContainer}>
        {displayedExecutable && 
            <p 
                className={styles.codeOutputCopy}
                onClick={() => {
                    setShowNewView(!showNewView);
                }}
            >{showNewView ? 'Back' : 'Execute'}
            </p>
            }
      <SyntaxHighlighter
        language="cypher"
        style={docco}
        wrapLines={true}
        wrapLongLines={true}
        customStyle={{ backgroundColor: 'transparent', color: 'white' }}
        showLineNumbers={false}
      >
        {displayedExecutable}
      </SyntaxHighlighter>
    </div>
  );
}