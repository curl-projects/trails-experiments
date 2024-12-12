import React from 'react';
import styles from './TypeSelector.module.css';
import { FaTimes } from 'react-icons/fa';

interface TypeSelectorProps {
  label: string;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  availableTypes: string[];
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({
  label,
  selectedTypes,
  setSelectedTypes,
  availableTypes,
}) => {
  const handleTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    if (newType && !selectedTypes.includes(newType)) {
      setSelectedTypes([...selectedTypes, newType]);
    }
    e.target.value = ''; // Reset select after adding
  };

  const removeType = (typeToRemove: string) => {
    setSelectedTypes(selectedTypes.filter(type => type !== typeToRemove));
  };

  return (
    <div className={styles.typeSelector}>
      <label>{label}:</label>
      <div className={styles.selectorContainer}>
        <select 
          onChange={handleTypeSelect}
          className={styles.select}
        >
          <option value="">Select type...</option>
          {availableTypes
            .filter(type => !selectedTypes.includes(type))
            .map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
        </select>
        <div className={styles.selectedTypes}>
          {selectedTypes.map(type => (
            <span key={type} className={styles.typeTag}>
              {type}
              <button
                onClick={() => removeType(type)}
                className={styles.removeButton}
              >
                <FaTimes size={10} />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}; 