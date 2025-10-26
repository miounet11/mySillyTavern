/**
 * World Info related types and interfaces
 */

export interface WorldInfo {
  id: string;
  name: string;
  description?: string;
  content: string;
  entries?: any[];
  keywords: string[];
  activationType: WorldInfoActivationType;
  priority: number;
  enabled: boolean;
  isActive?: boolean;
  isGlobal?: boolean;
  characterIds: string[]; // Applied to these characters (empty = global)
  createdAt: Date;
  updatedAt: Date;
  settings?: WorldInfoSettings;
}

export interface WorldInfoSettings {
  caseSensitive?: boolean;
  matchWholeWords?: boolean;
  useRegex?: boolean;
  minTriggerDistance?: number;
  maxActivationCount?: number;
  cooldownPeriod?: number;
}

export type WorldInfoActivationType = 'always' | 'keyword' | 'vector' | 'conditional';

export interface WorldInfoVector {
  id: string;
  worldInfoId: string;
  embedding: number[]; // Vector embedding
  text: string; // Original text for embedding
  similarity: number; // Similarity score when matched
  createdAt: Date;
}

export interface CreateWorldInfoParams {
  name: string;
  content: string;
  keywords?: string[];
  activationType: WorldInfoActivationType;
  priority?: number;
  enabled?: boolean;
  characterIds?: string[];
  settings?: Partial<WorldInfoSettings>;
}

export interface UpdateWorldInfoParams {
  name?: string;
  content?: string;
  keywords?: string[];
  activationType?: WorldInfoActivationType;
  priority?: number;
  enabled?: boolean;
  characterIds?: string[];
  settings?: Partial<WorldInfoSettings>;
}

export interface WorldInfoMatch {
  worldInfo: WorldInfo;
  matchType: WorldInfoActivationType;
  matchScore: number;
  matchedKeywords?: string[];
  position?: number; // Position in text where matched
  context?: string; // Context around the match
}

export interface WorldInfoSearchResult {
  matches: WorldInfoMatch[];
  totalMatches: number;
  processingTime: number;
}

export interface WorldInfoActivationResult {
  activatedEntries: WorldInfo[];
  injectedContent: string;
  processingTime: number;
  metadata: {
    keywordMatches: number;
    vectorMatches: number;
    alwaysActiveCount: number;
  };
}

export interface WorldInfoImportData {
  name: string;
  content: string;
  keywords: string[];
  priority?: number;
  activationType: WorldInfoActivationType;
  settings?: Partial<WorldInfoSettings>;
}

export interface WorldInfoExportOptions {
  format: 'json' | 'txt' | 'csv';
  includeDisabled?: boolean;
  includeSettings?: boolean;
  groupByCharacter?: boolean;
}

export interface WorldInfoSearchFilters {
  query?: string;
  activationType?: WorldInfoActivationType;
  characterId?: string;
  enabled?: boolean;
  priority?: {
    min?: number;
    max?: number;
  };
  sortBy?: 'name' | 'priority' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface WorldInfoValidationErrors {
  name?: string;
  content?: string;
  keywords?: string;
  activationType?: string;
  general?: string[];
}

// World info categories/organization
export interface WorldInfoCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  worldInfoIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorldInfoTag {
  id: string;
  name: string;
  color?: string;
  worldInfoIds: string[];
  createdAt: Date;
}

// Vector search settings
export interface VectorSearchSettings {
  model: string; // Embedding model to use
  similarityThreshold: number; // Minimum similarity score (0-1)
  maxResults: number; // Maximum number of results to return
  includeContent: boolean; // Include full content in results
}

// Keyword matching settings
export interface KeywordMatchSettings {
  caseSensitive: boolean;
  wholeWordsOnly: boolean;
  useRegex: boolean;
  maxDistance: number; // Maximum distance between keywords for multi-keyword matches
}

// Conditional activation settings
export interface ConditionalActivationSettings {
  conditions: WorldInfoCondition[];
  operator: 'AND' | 'OR'; // How to combine multiple conditions
}

export interface WorldInfoCondition {
  type: 'message_count' | 'user_input' | 'time_elapsed' | 'character_state' | 'custom';
  parameter: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'matches';
  value: string | number;
}

// Analytics and usage tracking
export interface WorldInfoUsage {
  worldInfoId: string;
  activationCount: number;
  lastActivatedAt: Date;
  averageActivationScore: number;
  topKeywords: string[];
  usageByCharacter: Record<string, number>;
}

// Bulk operations
export interface BulkWorldInfoOperation {
  action: 'enable' | 'disable' | 'delete' | 'update_priority' | 'assign_character' | 'remove_character';
  worldInfoIds: string[];
  parameters?: Record<string, any>;
}

export interface BulkOperationResult {
  successful: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
  totalProcessed: number;
}

// Search and indexing
export interface WorldInfoIndex {
  keywordIndex: Map<string, Set<string>>; // keyword -> worldInfoIds
  vectorIndex: Map<string, WorldInfoVector>; // text -> vector data
  alwaysActiveIndex: Set<string>; // worldInfoIds
  characterIndex: Map<string, Set<string>>; // characterId -> worldInfoIds
}

// Performance metrics
export interface WorldInfoPerformanceMetrics {
  searchTime: number;
  activationTime: number;
  memoryUsage: number;
  indexSize: number;
  cacheHitRate: number;
}