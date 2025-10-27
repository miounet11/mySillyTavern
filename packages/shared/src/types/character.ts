/**
 * Character related types and interfaces
 */

export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  firstMessage: string;
  avatar?: string;
  background: string;
  scenario?: string;
  exampleMessages: string[];
  tags: string[];
  messageCount?: number;
  createdAt: Date;
  updatedAt: Date;
  settings: CharacterSettings;
}

export interface CharacterSettings {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  promptTemplate?: string;
  jailbreakPrompt?: string;
  systemPrompt?: string;
}

export interface CreateCharacterParams {
  name: string;
  description: string;
  personality?: string;
  firstMessage: string;
  avatar?: File | string;
  background?: string;
  exampleMessages?: string[];
  tags?: string[];
  settings?: Partial<CharacterSettings>;
}

export interface UpdateCharacterParams {
  name?: string;
  description?: string;
  personality?: string;
  firstMessage?: string;
  avatar?: File;
  background?: string;
  exampleMessages?: string[];
  tags?: string[];
  settings?: Partial<CharacterSettings>;
}

export interface CharacterCard {
  // JSON format fields
  name: string;
  description: string;
  personality: string;
  first_mes: string; // First message
  avatar: string;
  background: string;
  example_messages: string[];
  mes_example: string; // Example dialogue (legacy format)
  scenario: string;
  first_mes_example: string;
  create_date: string;
  talkativeness: string;
  creator_notes: string;
  system_prompt: string;
  tags: string[];
  alternate_greetings: string[];
  character_book?: string; // World info data
}

export interface CharacterCardPNG {
  // PNG character card format
  name: string;
  description: string;
  personality: string;
  first_message: string;
  avatar: string; // Base64 encoded
  background: string;
  example_messages: string[];
  data: CharacterCard; // Full JSON data embedded
}

export interface CharacterImportResult {
  character: Character;
  warnings?: string[];
  errors?: string[];
}

export interface CharacterExportOptions {
  format: 'json' | 'png' | 'tavernai';
  includeMessages?: boolean;
  includeAvatar?: boolean;
  compress?: boolean;
}

export interface CharacterSearchFilters {
  query?: string;
  tags?: string[];
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'message_count';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CharacterValidationErrors {
  name?: string;
  description?: string;
  firstMessage?: string;
  personality?: string;
  avatar?: string;
  general?: string[];
}

// Character card format types
export type CharacterCardFormat = 'json' | 'png' | 'tavernai' | 'character.ai';

// Character creation status
export type CharacterCreationStatus = 'draft' | 'complete' | 'error';

// Character visibility
export type CharacterVisibility = 'public' | 'private' | 'unlisted';