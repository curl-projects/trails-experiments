// Basic Neo4j Types
import { Node, Relationship } from "./GraphTypes";

export interface Path {
  nodes: Node[];
  relationships: Relationship[];
}


export interface Strategy {
  id: string;
  strategy_name: string;
  pathmap: Record<string, string>;
  disallowed_successors: Record<string, Array<Array<string>>>;
}

// Strategy and Composition Types
export interface Protocol {
  id: string;
  strategy: Strategy;
  input_type: string;
  output_type: string;
  natural_language_description: string;
}

export interface Composition {
  id: string;
  protocols: Protocol[];
  nl_description: string;
}

export interface ParameterizedComposition {
  id: string;
  composition: Composition;
  params: Array<{ limit?: number; [key: string]: any; }>;
  probability: number | null;
}

export interface Output {
  id: string;
  node: Node;
  parameterized_compositions: ParameterizedComposition[];
  metadata: {
    path_count?: number;
    avg_path_length?: number;
    [key: string]: any;
  };
  paths: Record<string, Path[]>;
}

export interface RankingDistribution {
  input_diversity: number;
  protocol_diversity: number;
  content_diversity: number;
  input_preference: number;
  strategy_preference: number;
  content_quality: number;
  timeliness: number;
  content_distance: number;
}

export interface RankingScores {
  input_diversity: number;
  protocol_diversity: number;
  content_diversity: number;
  input_preference: number;
  strategy_preference: number;
  content_quality: number;
  timeliness: number;
  content_distance: number;
}

export interface ProtocolDistribution {
  [key: string]: number;
}

export interface RankedOutput {
  id: string;
  output: Output;
  ranking_score: number;
  ranking_distribution: RankingDistribution;
  ranking_scores: RankingScores;
  protocol_distribution: ProtocolDistribution;
}

// Event Types
export interface NodeEvent {
  id: string;
  event_type: 'add' | 'update';
  ranked_output: RankedOutput;
  message?: string | null;
}

export interface ErrorEvent {
  id: string;
  event_type: 'error';
  message: string;
  traceback?: string;
}

export interface ConnectionEvent {
  id: string;
  event_type: 'connection';
  status: 'connected' | 'disconnected';
  timestamp: string;
}

export interface TriggerEvent {
  id: string;
  event_type: 'trigger';
  action: string;
  timestamp: string;
}

export interface ValidationEvent {
  id: string;
  event_type: 'validation';
  status: 'success' | 'failure';
  message: string;
  details: Record<string, any>;
}

export interface DataEvent {
  id: string;
  event_type: 'data';
  data: any;
}

export type Event = NodeEvent | ErrorEvent | ConnectionEvent | TriggerEvent | ValidationEvent | DataEvent;


