import React, { createContext, useContext, ReactNode } from 'react';
import { Node, PostNode, AuthorNode, ConceptNode, EntityNode, AccountNode } from '~/types/GraphTypes';

interface FeedContextType {
  getNodeTitle: (node: Node) => string;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export const FeedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
    const pathNameMap: Record<string, (node: Node) => string> = {
        "Post": (node: Node) => node.labels[0] === "Post" ? `Post('${(node as PostNode).properties.title}')` : `Post(unknown)`,
        "Author": (node: Node) => node.labels[0] === "Author" ? `Author('${(node as AuthorNode).properties.name}')` : `Author(unknown)`,
        "Concept": (node: Node) => node.labels[0] === "Concept" ? `Concept('${(node as ConceptNode).properties.name}')` : `Concept(unknown)`,
        "Entity": (node: Node) => node.labels[0] === "Entity" ? `Entity('${(node as EntityNode).properties.name}')` : `Entity(unknown)`,
        "Account": (node: Node) => node.labels[0] === "Account" ? `Account('${(node as AccountNode).properties.username}')` : `Account(unknown)`
      } as const;

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