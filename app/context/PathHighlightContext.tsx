import React, { createContext, useContext, useState } from 'react';
import { Path } from '~/types/FeedTypes';

interface PathHighlightContextType {
  highlightedPath: Path | null;
  setHighlightedPath: (path: Path | null) => void;
  pinnedPaths: Path[];
  togglePinnedPath: (path: Path) => void;
}

const PathHighlightContext = createContext<PathHighlightContextType | undefined>(undefined);

export function PathHighlightProvider({ children }: { children: React.ReactNode }) {
  const [highlightedPath, setHighlightedPath] = useState<Path | null>(null);
  const [pinnedPaths, setPinnedPaths] = useState<Path[]>([]);

  const togglePinnedPath = (path: Path) => {
    setPinnedPaths(current => {
      const pathKey = path.nodes.map(n => n.properties.id).join('-');
      const isAlreadyPinned = current.some(p => 
        p.nodes.map(n => n.properties.id).join('-') === pathKey
      );

      if (isAlreadyPinned) {
        return current.filter(p => 
          p.nodes.map(n => n.properties.id).join('-') !== pathKey
        );
      } else {
        return [...current, path];
      }
    });
  };

  return (
    <PathHighlightContext.Provider value={{ 
      highlightedPath, 
      setHighlightedPath,
      pinnedPaths,
      togglePinnedPath
    }}>
      {children}
    </PathHighlightContext.Provider>
  );
}

export function usePathHighlight() {
  const context = useContext(PathHighlightContext);
  if (context === undefined) {
    throw new Error('usePathHighlight must be used within a PathHighlightProvider');
  }
  return context;
} 