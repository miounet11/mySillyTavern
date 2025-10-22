/**
 * Chat related types and interfaces
 */

export interface Chat {
  id: string;
  title: string;
  characterId: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: ChatSettings;
  messageCount?: number;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  model?: string;
  usage?: TokenUsage;
  generationTime?: number;
  isRegenerated?: boolean;
  branchId?: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatSettings {
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  customHeaders?: Record<string, string>;
}

export interface ChatBranch {
  id: string;
  parentId: string | null;
  chatId: string;
  branchPoint: string; // message ID where branch starts
  title: string;
  createdAt: Date;
  isActive: boolean;
}

export interface CreateChatParams {
  title: string;
  characterId: string;
  settings?: Partial<ChatSettings>;
}

export interface CreateMessageParams {
  content: string;
  role: 'user' | 'system';
  metadata?: Partial<MessageMetadata>;
}

export interface GenerationOptions {
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  regenerate?: boolean;
}

export interface GenerationResponse {
  message: Message;
  usage?: TokenUsage;
  metadata?: {
    model: string;
    processingTime: number;
    queueTime?: number;
  };
}

export interface ChatExport {
  chat: Chat;
  messages: Message[];
  character?: Character;
  exportedAt: Date;
  format: 'json' | 'txt' | 'html';
}

// Import Character type to avoid circular dependency
import type { Character } from './character';