/**
 * Main types export file
 */

// Core types
export * from './chat';
export * from './character';
export * from './ai-model';
export * from './world-info';
export * from './plugin';

// Common utility types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  message?: string;
  metadata?: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: PaginationParams;
}

export interface BulkOperationResult {
  successful: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
  totalProcessed: number;
  totalSuccessful: number;
  totalFailed: number;
}

// User and authentication types (for future expansion)
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  ui: UISettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: Record<string, boolean>;
}

export interface PrivacySettings {
  shareUsage: boolean;
  shareAnalytics: boolean;
  publicProfile: boolean;
  allowInvites: boolean;
}

export interface UISettings {
  fontSize: 'small' | 'medium' | 'large';
  sidebarWidth: number;
  compactMode: boolean;
  showTimestamps: boolean;
  showAvatars: boolean;
  messageLayout: 'bubble' | 'compact';
}

// Configuration types
export interface AppConfig {
  name: string;
  version: string;
  description: string;
  environment: 'development' | 'staging' | 'production';
  features: Record<string, boolean>;
  limits: {
    maxCharacters: number;
    maxChats: number;
    maxWorldInfoEntries: number;
    maxPlugins: number;
  };
  integrations: {
    analytics?: string;
    monitoring?: string;
    errorReporting?: string;
  };
}

// Theme and styling types
export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, number>;
}

export interface ThemeSpacing {
  unit: number;
  scale: Record<string, number>;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  full: string;
}

// File and media types
export interface FileUpload {
  file: File;
  preview?: string;
  progress?: number;
  error?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

export interface MediaAsset {
  id: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Export/Import types
export interface ExportOptions {
  format: 'json' | 'txt' | 'csv' | 'html';
  includePrivate?: boolean;
  compress?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: ImportError[];
  warnings: string[];
}

export interface ImportError {
  row?: number;
  field?: string;
  value?: any;
  error: string;
  severity: 'error' | 'warning';
}

// Analytics and metrics types
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface Metrics {
  chats: ChatMetrics;
  characters: CharacterMetrics;
  ai: AIMetrics;
  system: SystemMetrics;
}

export interface ChatMetrics {
  total: number;
  active: number;
  averageMessages: number;
  averageDuration: number;
  popularCharacters: Array<{
    characterId: string;
    name: string;
    count: number;
  }>;
}

export interface CharacterMetrics {
  total: number;
  public: number;
  private: number;
  averageRating: number;
  mostUsed: Array<{
    characterId: string;
    name: string;
    usageCount: number;
  }>;
}

export interface AIMetrics {
  totalRequests: number;
  averageResponseTime: number;
  totalTokens: number;
  cost: number;
  errors: number;
  byProvider: Record<string, {
    requests: number;
    responseTime: number;
    tokens: number;
    cost: number;
  }>;
}

export interface SystemMetrics {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  storageUsage: number;
  activeUsers: number;
  errors: number;
}

// Re-export all types for easy importing
export type {
  // Chat types
  Chat,
  Message,
  MessageMetadata,
  TokenUsage,
  ChatSettings,
  ChatBranch,
  CreateChatParams,
  CreateMessageParams,
  GenerationOptions,
  GenerationResponse,
  ChatExport,

  // Character types
  Character,
  CharacterSettings,
  CreateCharacterParams,
  UpdateCharacterParams,
  CharacterCard,
  CharacterCardPNG,
  CharacterImportResult,
  CharacterExportOptions,
  CharacterSearchFilters,
  CharacterValidationErrors,
  CharacterCardFormat,
  CharacterCreationStatus,
  CharacterVisibility,

  // AI Model types
  AIModelConfig,
  ModelSettings,
  AIProvider,
  CreateAIModelParams,
  UpdateAIModelParams,
  ModelTestResult,
  ModelInfo,
  ModelPricing,
  ModelCapabilities,
  AvailableModels,
  GenerationRequest,
  ChatMessage,
  MultimodalContent,
  GenerationSettings,
  GenerationResponse as GenResponse,
  Choice,
  StreamingChunk,
  StreamingChoice,
  AIModelError,
  OpenAIConfig,
  AnthropicConfig,
  LocalAIConfig,

  // World Info types
  WorldInfo,
  WorldInfoSettings,
  WorldInfoActivationType,
  WorldInfoVector,
  CreateWorldInfoParams,
  UpdateWorldInfoParams,
  WorldInfoMatch,
  WorldInfoSearchResult,
  WorldInfoActivationResult,
  WorldInfoImportData,
  WorldInfoExportOptions,
  WorldInfoSearchFilters,
  WorldInfoValidationErrors,
  WorldInfoCategory,
  WorldInfoTag,
  VectorSearchSettings,
  KeywordMatchSettings,
  ConditionalActivationSettings,
  WorldInfoCondition,
  WorldInfoUsage,
  BulkWorldInfoOperation,
  BulkOperationResult,
  WorldInfoIndex,
  WorldInfoPerformanceMetrics,

  // Plugin types
  Plugin,
  PluginManifest,
  PluginPermission,
  PluginPermissionType,
  PluginConfig,
  PluginConfigSchema,
  PluginConfigProperty,
  PluginSettings,
  PluginScopeType,
  PluginHook,
  PluginHooks,
  ChatHookContext,
  ChatHookResult,
  GenerationHookContext,
  GenerationHookResult,
  CharacterHookContext,
  CharacterHookResult,
  WorldInfoHookContext,
  WorldInfoHookResult,
  UIHookContext,
  UIHookResult,
  MenuHookContext,
  MenuItem,
  SystemHookContext,
  ErrorHookContext,
  PluginInstallationResult,
  PluginUpdateResult,
  PluginUninstallationResult,
  PluginRepository,
  RepositoryPlugin,
  PluginDevelopmentConfig,
  PluginTestResult,
  PluginTest,
  PluginUsage,
  PluginMarketplaceData,
  PluginCategory,
} from '.';