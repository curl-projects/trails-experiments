// Base Types
export interface BaseNode {
    id: string;
    labels: string[];
    properties: Record<string, any>;
  }
  
  export interface BaseRelationship {
    id: string;
    type: string;
    start_node_id: string;
    end_node_id: string;
    properties: Record<string, any>;
  }
  
  // Node Types
  export interface AccountNode extends BaseNode {
    labels: ['Account'];
    properties: {
      id?: string;
      username?: string;
    }
  }
  
  export interface AuthorNode extends BaseNode {
    labels: ['Author'];
    properties: {
      id?: string;
      name?: string;
    }
  }
  
  export interface ConceptNode extends BaseNode {
    labels: ['Concept'];
    properties: {
      id?: string;
      weight?: number;
      name?: string;
      relevance?: number;
      quality?: number;
    }
  }
  
  export interface PostNode extends BaseNode {
    labels: ['Post'];
    properties: {
      id?: string;
      content?: string;
      title?: string;
      popularity?: number;
    }
  }
  
  export interface EntityNode extends BaseNode {
    labels: ['Entity'];
    properties: {
      id?: string;
      name?: string;
    }
  }
  
  
  export type Node = AccountNode | AuthorNode | ConceptNode | PostNode | EntityNode;
  
  // Relationship Types
  export interface RETWEETEDRelationship extends BaseRelationship {
    type: 'RETWEETED';
    properties: {
      id?: string;
    }
  }
  
  export interface RELATED_TORelationship extends BaseRelationship {
    type: 'RELATED_TO';
    properties: {
      id?: string;
      weight?: number;
    }
  }
  
  export interface AUTHORED_BYRelationship extends BaseRelationship {
    type: 'AUTHORED_BY';
    properties: {
      id?: string;
    }
  }
  
  export interface HAS_CONCEPTRelationship extends BaseRelationship {
    type: 'HAS_CONCEPT';
    properties: {
      id?: string;
    }
  }
  
  export interface DEPICTSRelationship extends BaseRelationship {
    type: 'DEPICTS';
    properties: {
      id?: string;
    }
  }
  
  export interface MENTIONSRelationship extends BaseRelationship {
    type: 'MENTIONS';
    properties: {
      id?: string;
    }
  }
  
  export interface REPLIED_TORelationship extends BaseRelationship {
    type: 'REPLIED_TO';
    properties: {
      id?: string;
    }
  }
  
  export interface SIMILAR_TONERelationship extends BaseRelationship {
    type: 'SIMILAR_TONE';
    properties: {
      id?: string;
      similarity?: number;
    }
  }
  
  export interface LIKESRelationship extends BaseRelationship {
    type: 'LIKES';
    properties: {
      id?: string;
    }
  }
  
  export interface INTERACTS_WITHRelationship extends BaseRelationship {
    type: 'INTERACTS_WITH';
    properties: {
      id?: string;
      weight?: number;
    }
  }
  
  
  export type Relationship = RETWEETEDRelationship | RELATED_TORelationship | AUTHORED_BYRelationship | HAS_CONCEPTRelationship | DEPICTSRelationship | MENTIONSRelationship | REPLIED_TORelationship | SIMILAR_TONERelationship | LIKESRelationship | INTERACTS_WITHRelationship;
  