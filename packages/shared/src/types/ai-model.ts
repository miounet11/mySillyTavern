/**
 * AI Model related types and interfaces
 */

export interface AIModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  model: string;
  apiKey: string; // encrypted in database
  baseUrl?: string;
  settings: ModelSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  systemPrompt?: string;
  contextWindow?: number;
  maxResponseTokens?: number;
  customHeaders?: Record<string, string>;
}

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'local' | 'novelai' | 'horde' | 'custom' | 'kobold' | 'ooba' | 'newapi';

export interface CreateAIModelParams {
  name: string;
  provider: AIProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  settings?: Partial<ModelSettings>;
  isActive?: boolean;
}

export interface UpdateAIModelParams {
  name?: string;
  apiKey?: string;
  baseUrl?: string;
  settings?: Partial<ModelSettings>;
  isActive?: boolean;
}

export interface ModelTestResult {
  success: boolean;
  latency: number;
  modelInfo?: ModelInfo;
  error?: string;
  errorDetails?: any;
}

export interface ModelInfo {
  name: string;
  provider: AIProvider;
  maxTokens: number;
  contextWindow: number;
  pricing?: ModelPricing;
  capabilities?: ModelCapabilities;
}

export interface ModelPricing {
  inputTokenPrice: number; // per 1K tokens
  outputTokenPrice: number; // per 1K tokens
  currency: string;
}

export interface ModelCapabilities {
  streaming: boolean;
  images: boolean;
  tools: boolean;
  vision: boolean;
  audio: boolean;
}

export interface AvailableModels {
  [provider: string]: {
    models: string[];
    requiresApiKey: boolean;
    baseUrl?: string;
    defaultSettings?: Partial<ModelSettings>;
  };
}

export interface Tool {
  type: string;
  function?: {
    name: string;
    description?: string;
    parameters?: Record<string, any>;
  };
}

export interface GenerationRequest {
  messages: ChatMessage[];
  model: string;
  settings: GenerationSettings;
  stream?: boolean;
  tools?: Tool[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | MultimodalContent[];
}

export interface MultimodalContent {
  type: 'text' | 'image';
  text?: string;
  image?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

export interface GenerationSettings extends ModelSettings {
  model: string;
  stream?: boolean;
  stop?: string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
  logitBias?: Record<string, number>;
  user?: string;
}

export interface GenerationResponse {
  id: string;
  object: 'chat.completion' | 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Choice[];
  usage?: AITokenUsage;
}

export interface Choice {
  index: number;
  message?: ChatMessage;
  delta?: Partial<ChatMessage>;
  finish_reason?: 'stop' | 'length' | 'content_filter' | 'function_call' | 'tool_calls';
}

export interface AITokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface StreamingChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: StreamingChoice[];
}

export interface StreamingChoice {
  index: number;
  delta: {
    role?: string;
    content?: string;
  };
  finish_reason?: string | null;
}

// Error types
export interface AIModelError {
  code: string;
  message: string;
  type: 'authentication' | 'rate_limit' | 'invalid_request' | 'api_error' | 'network' | 'timeout';
  provider: AIProvider;
  details?: any;
}

// Provider-specific configurations
export interface OpenAIConfig {
  apiKey: string;
  organization?: string;
  baseUrl?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface AnthropicConfig {
  apiKey: string;
  baseUrl?: string;
  maxRetries?: number;
  timeout?: number;
  version?: string;
}

export interface LocalAIConfig {
  baseUrl: string;
  apiKey?: string;
  maxRetries?: number;
  timeout?: number;
  headers?: Record<string, string>;
}

// API response wrappers
export interface APIResponse<T> {
  data: T;
  success: boolean;
  error?: AIModelError;
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTime: number;
  };
}