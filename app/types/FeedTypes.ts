// Basic Neo4j Types
export interface Node {
  id: string;
  labels: string[];
  properties: Record<string, any>;
}

export interface Relationship {
  id: string;
  type: string;
  start_node_id: string;
  end_node_id: string;
  properties: Record<string, any>;
}

export interface Path {
  nodes: Node[];
  relationships: Relationship[];
}

// Strategy and Composition Types
export interface Strategy {
  name: string;
  input_type: string;
  output_type: string;
}

export interface Composition {
  strategies: Strategy[];
  path_name_map: Record<string, (node: Node) => string>;
}

// Output Types
export interface Output {
  node: Node;
  compositions: Record<string, Path[]>;
  metadata: {
    path_count?: number;
    avg_path_length?: number;
    composition_count?: number;
    [key: string]: any;
  };
  composition_params: Record<string, {
    params: Array<{ limit?: number; [key: string]: any; }>;
    probability: number | null;
  }>;
}

export interface RankedOutput {
  output: Output;
  compositions: Record<string, Path[]>;
  node: Node;
  metadata: Record<string, any>;
  composition_params: Record<string, any>;
  ranking_score: number;
  ranking_distribution: {
    input_diversity: number;
    protocol_diversity: number;
    content_diversity: number;
    input_preference: number;
    strategy_preference: number;
    content_quality: number;
    timeliness: number;
    content_distance: number;
    [key: string]: number;
  };
  sub_scores: {
    input_diversity: number;
    protocol_diversity: number;
    content_diversity: number;
    input_preference: number;
    strategy_preference: number;
    content_quality: number;
    timeliness: number;
    content_distance: number;
    [key: string]: number;
  };
  strategy_distribution: Record<string, number>;
}

// Event Types
export interface NodeEvent {
  event_type: 'add' | 'update';
  ranked_output: RankedOutput;
  message?: string | null;
}

export interface ErrorEvent {
  event_type: 'error';
  message: string;
  traceback?: string;
}

export interface ConnectionEvent {
  event_type: 'connection';
  status: 'connected' | 'disconnected';
  timestamp: string;
}

export interface TriggerEvent {
  event_type: 'trigger';
  action: string;
  timestamp: string;
}


export type Event = NodeEvent | ErrorEvent | ConnectionEvent | TriggerEvent;