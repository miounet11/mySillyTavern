/**
 * Plugin system related types and interfaces
 */

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license: string;
  keywords: string[];
  enabled: boolean;
  config: PluginConfig;
  manifest: PluginManifest;
  installedAt: Date;
  updatedAt: Date;
  dependencies: string[];
  devDependencies?: string[];
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  main: string; // Entry point
  author: string;
  license: string;
  keywords: string[];
  homepage?: string;
  repository?: string;
  bugs?: string;
  engines: {
    node: string;
    npm?: string;
  };
  permissions: PluginPermission[];
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  configSchema: PluginConfigSchema;
  hooks: string[]; // Available hooks
  provides: string[]; // What this plugin provides
  requires: string[]; // What this plugin requires
}

export interface PluginPermission {
  type: PluginPermissionType;
  description: string;
  required: boolean;
}

export type PluginPermissionType =
  | 'network'
  | 'file_system'
  | 'database'
  | 'ai_models'
  | 'user_data'
  | 'system_info'
  | 'camera'
  | 'microphone'
  | 'location'
  | 'notifications'
  | 'clipboard';

export interface PluginConfig {
  [key: string]: any;
}

export interface PluginConfigSchema {
  type: 'object';
  properties: Record<string, PluginConfigProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface PluginConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  title: string;
  description?: string;
  default?: any;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: string;
  items?: PluginConfigProperty;
  properties?: Record<string, PluginConfigProperty>;
}

export interface PluginSettings {
  pluginId: string;
  scopeType: PluginScopeType;
  scopeId?: string; // characterId, chatId, or 'global'
  config: PluginConfig;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PluginScopeType = 'global' | 'character' | 'chat';

export interface PluginHook {
  name: string;
  description: string;
  parameters: PluginHookParameter[];
  returnType: string;
  context: PluginHookContext;
}

export interface PluginHookParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: any;
}

export interface PluginHookContext {
  phase: 'before' | 'after' | 'instead';
  priority: number;
  cancellable: boolean;
}

// Core plugin hooks
export interface PluginHooks {
  // Chat hooks
  'chat:before:message': (context: ChatHookContext) => Promise<ChatHookResult>;
  'chat:after:message': (context: ChatHookContext) => Promise<void>;
  'chat:before:generation': (context: GenerationHookContext) => Promise<GenerationHookResult>;
  'chat:after:generation': (context: GenerationHookContext) => Promise<void>;

  // Character hooks
  'character:before:create': (context: CharacterHookContext) => Promise<CharacterHookResult>;
  'character:after:create': (context: CharacterHookContext) => Promise<void>;
  'character:before:update': (context: CharacterHookContext) => Promise<CharacterHookResult>;
  'character:after:update': (context: CharacterHookContext) => Promise<void>;

  // World info hooks
  'worldinfo:before:activation': (context: WorldInfoHookContext) => Promise<WorldInfoHookResult>;
  'worldinfo:after:activation': (context: WorldInfoHookContext) => Promise<void>;

  // UI hooks
  'ui:before:render': (context: UIHookContext) => Promise<UIHookResult>;
  'ui:after:render': (context: UIHookContext) => Promise<void>;
  'ui:menu:add': (context: MenuHookContext) => Promise<MenuItem[]>;

  // System hooks
  'system:startup': (context: SystemHookContext) => Promise<void>;
  'system:shutdown': (context: SystemHookContext) => Promise<void>;
  'system:error': (context: ErrorHookContext) => Promise<void>;
}

// Hook context types
export interface ChatHookContext {
  chatId: string;
  message: any;
  user?: any;
  metadata?: Record<string, any>;
}

export interface ChatHookResult {
  message?: any;
  cancel?: boolean;
  metadata?: Record<string, any>;
}

export interface GenerationHookContext {
  chatId: string;
  prompt: string;
  options: any;
  user?: any;
}

export interface GenerationHookResult {
  prompt?: string;
  options?: any;
  cancel?: boolean;
  metadata?: Record<string, any>;
}

export interface CharacterHookContext {
  character?: any;
  data: any;
  user?: any;
}

export interface CharacterHookResult {
  character?: any;
  cancel?: boolean;
  metadata?: Record<string, any>;
}

export interface WorldInfoHookContext {
  worldInfo?: any;
  query: string;
  context: any;
  characterId?: string;
}

export interface WorldInfoHookResult {
  worldInfo?: any;
  cancel?: boolean;
  metadata?: Record<string, any>;
}

export interface UIHookContext {
  component: string;
  props: any;
  user?: any;
}

export interface UIHookResult {
  props?: any;
  component?: any;
  cancel?: boolean;
}

export interface MenuHookContext {
  menu: string;
  context: any;
  user?: any;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  action: string;
  enabled?: boolean;
  submenu?: MenuItem[];
}

export interface SystemHookContext {
  event: string;
  data?: any;
  user?: any;
}

export interface ErrorHookContext {
  error: Error;
  context: string;
  user?: any;
}

// Plugin management
export interface PluginInstallationResult {
  plugin: Plugin;
  success: boolean;
  warnings?: string[];
  errors?: string[];
  dependencies?: string[];
}

export interface PluginUpdateResult {
  plugin: Plugin;
  previousVersion: string;
  success: boolean;
  changelog?: string[];
  warnings?: string[];
  errors?: string[];
}

export interface PluginUninstallationResult {
  pluginId: string;
  success: boolean;
  removedFiles?: string[];
  warnings?: string[];
  errors?: string[];
}

// Plugin repository
export interface PluginRepository {
  id: string;
  name: string;
  url: string;
  description: string;
  verified: boolean;
  official: boolean;
  lastSync?: Date;
  pluginCount: number;
}

export interface RepositoryPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  repository: string;
  downloadUrl: string;
  downloads: number;
  rating: number;
  tags: string[];
  compatible: boolean;
  lastUpdated: Date;
}

// Plugin development
export interface PluginDevelopmentConfig {
  name: string;
  entry: string;
  output: string;
  watch: string[];
  external: string[];
  alias: Record<string, string>;
}

export interface PluginTestResult {
  pluginId: string;
  success: boolean;
  tests: PluginTest[];
  coverage?: number;
  errors?: string[];
}

export interface PluginTest {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

// Plugin analytics
export interface PluginUsage {
  pluginId: string;
  usageCount: number;
  lastUsed: Date;
  averageExecutionTime: number;
  errorCount: number;
  userCount: number;
  performanceMetrics: Record<string, number>;
}

// Plugin marketplace
export interface PluginMarketplaceData {
  categories: PluginCategory[];
  featured: RepositoryPlugin[];
  popular: RepositoryPlugin[];
  recent: RepositoryPlugin[];
  verified: RepositoryPlugin[];
}

export interface PluginCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  pluginCount: number;
}