import React, { createContext, useContext, ReactNode } from 'react';
import { Node, PostNode, AuthorNode, ConceptNode, EntityNode, AccountNode } from '~/types/GraphTypes';
import { ParameterizedComposition } from '~/types/FeedTypes';

interface PathGroupTitle {
  protocolString: string;
  description: string;
}

interface FeedContextType {
  getNodeTitle: (node: Node) => string;
  getNodeTypeColors: (nodeType: string) => NodeTypeColors;
  formatPathGroupTitle: (pathKey: string, compositions: ParameterizedComposition[]) => PathGroupTitle;
}

interface NodeTypeColors {
    background: string;
    text: string;
  }
  

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export const FeedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
    const pathNameMap: Record<string, (node: Node) => string> = {
        "Post": (node: Node) => node.labels[0] === "Post" ? (node as PostNode).properties.title ?? 'unknown' : 'unknown',
        "Author": (node: Node) => node.labels[0] === "Author" ? (node as AuthorNode).properties.name ?? 'unknown' : 'unknown',
        "Concept": (node: Node) => node.labels[0] === "Concept" ? (node as ConceptNode).properties.name ?? 'unknown' : 'unknown',
        "Entity": (node: Node) => node.labels[0] === "Entity" ? (node as EntityNode).properties.name ?? 'unknown' : 'unknown',
        "Account": (node: Node) => node.labels[0] === "Account" ? (node as AccountNode).properties.username ?? 'unknown' : 'unknown'
    } as const;

  const getNodeTitle = (node: Node): string => {
    const getTitle = pathNameMap[node.labels[0]];
    return getTitle ? getTitle(node) : `Node ID: ${node.id}`;
  };

  const nodeColorMap: Record<string, NodeTypeColors> = {
    'Post': {
      background: '#ebf8ff',  // light blue
      text: '#2c5282'        // dark blue
    },
    'Author': {
      background: '#faf5ff',  // light purple
      text: '#553c9a'        // dark purple
    },
    'Concept': {
      background: '#f0fff4',  // light green
      text: '#276749'        // dark green
    },
    'Entity': {
      background: '#fff5f5',  // light red
      text: '#9b2c2c'        // dark red
    },
    'Account': {
      background: '#fffaf0',  // light orange
      text: '#9c4221'        // dark orange
    }
  } as const;
  
  const getNodeTypeColors = (nodeType: string): NodeTypeColors => {
    return nodeColorMap[nodeType] || { background: '#f7fafc', text: '#4a5568' };
  };

  const formatPathGroupTitle = (
    pathKey: string,
    parameterizedCompositions: ParameterizedComposition[]
  ): PathGroupTitle => {
    const match = pathKey.match(/Strategy\((.*?)\), (.*?), (.*?)\)/);
    if (!match) return { 
      protocolString: pathKey,
      description: ''
    };

    const [_, strategyName, inputType, outputType] = match;
    
    const matchingComposition = parameterizedCompositions.find(comp => 
      comp.composition.protocols.some(protocol => 
        protocol.strategy.strategy_name === strategyName &&
        protocol.input_type === inputType &&
        protocol.output_type === outputType
      )
    );

    if (!matchingComposition) return {
      protocolString: pathKey,
      description: ''
    };

    return {
      protocolString: matchingComposition.composition.protocols
        .map(p => `(${p.strategy.strategy_name}, ${p.input_type}, ${p.output_type})`)
        .join(' → '),
      description: matchingComposition.composition.nl_description
    };
  };

  return (
    <FeedContext.Provider value={{ 
      getNodeTitle, 
      getNodeTypeColors, 
      formatPathGroupTitle 
    }}>
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