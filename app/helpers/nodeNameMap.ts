import { Node, PostNode, AuthorNode, ConceptNode, EntityNode, AccountNode } from '~/types/GraphTypes';

type NodeNameGetter = (node: Node) => string;

export const getNodeDisplayName: NodeNameGetter = (node: Node): string => {
  switch (node.labels[0]) {
    case 'Post':
      return (node as PostNode).properties.title || 'Untitled';
    case 'Author':
    case 'Concept':
    case 'Entity':
      return (node as AuthorNode | ConceptNode | EntityNode).properties.name || 'Unnamed';
    case 'Account':
      return (node as AccountNode).properties.username || 'Anonymous';
    default:
      return 'Unknown';
  }
};