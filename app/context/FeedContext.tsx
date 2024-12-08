import React, { createContext, useContext, ReactNode } from 'react';
import { Node } from '~/types/FeedTypes';

interface FeedContextType {
  getNodeTitle: (node: Node) => string;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export const FeedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
    const pathNameMap: Record<string, (node: Node) => string> = {
    "Post": (node) => `Post('${node.properties.title}')`,
    "Author": (node) => `Author('${node.properties.name}')`,
    "Concept": (node) => `Concept('${node.properties.name}')`,
    // Add more mappings as needed
  };

  const getNodeTitle = (node: Node): string => {
    const getTitle = pathNameMap[node.labels[0]];
    return getTitle ? getTitle(node) : `Node ID: ${node.id}`;
  };

  return (
    <FeedContext.Provider value={{ getNodeTitle }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeedContext = (): FeedContextType => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeedContext must be used within a FeedProvider');
  }
  return context;
};