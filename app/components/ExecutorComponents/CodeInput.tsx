import { useState } from 'react';
import styles from './ExecutorLayout.module.css';

interface CodeInputProps {
  onExecute: (code: string, inputNode: string) => void;
  isConnected: boolean;
}

export function CodeInput({ onExecute, isConnected }: CodeInputProps) {
  const [code, setCode] = useState('');
  const [inputNode, setInputNode] = useState('');

  const handleSubmit = () => {
    if (code.trim() && inputNode.trim()) {
      onExecute(code, inputNode);
    }
  };

  return (
    <div className={styles.inputPanel}>
      <div className={styles.inputNodeSection}>
        <label htmlFor="inputNode">Input Node ID:</label>
        <input
          id="inputNode"
          type="text"
          className={styles.inputNodeField}
          value={inputNode}
          onChange={(e) => setInputNode(e.target.value)}
          placeholder="Enter node ID (e.g., b509d1a2-e9f3-4605-b027-44eb62f10e6d)"
        />
      </div>
      <textarea
        className={styles.codeInput}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter your Cypher query here..."
      />
      <button
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={!isConnected || !code.trim() || !inputNode.trim()}
      >
        {isConnected ? 'Execute Query' : 'Connecting...'}
      </button>
    </div>
  );
} 