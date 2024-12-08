// Basic Neo4j Types
import { Node, Relationship } from "./GraphTypes";

export interface Path {
  nodes: Node[];
  relationships: Relationship[];
}

export interface Strategy {
  strategy_name: string;
  path_map: Record<string, string>;
  disallowed_successors: Record<string, Array<Array<string>>>;
}

// Strategy and Composition Types
export interface Protocol {
  strategy: Strategy;
  input_type: string;
  output_type: string;
}

export interface Composition {
  protocols: Protocol[];
  nl_description: string;
}

export interface ParameterizedComposition {
  composition: Composition;
  params: Array<{ limit?: number; [key: string]: any; }>;
  probability: number | null;
}

export interface Output {
  node: Node;
  parameterized_compositions: ParameterizedComposition[];
  metadata: {
    path_count?: number;
    avg_path_length?: number;
    [key: string]: any;
  };
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
  output: Output;
  ranking_score: number;
  ranking_distribution: RankingDistribution;
  ranking_scores: RankingScores;
  protocol_distribution: ProtocolDistribution;
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


