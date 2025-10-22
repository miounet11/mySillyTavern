/**
 * API endpoint constants
 */

export const API_ENDPOINTS = {
  // Chat endpoints
  CHATS: '/api/chats',
  CHAT_BY_ID: (id: string) => `/api/chats/${id}`,
  CHAT_MESSAGES: (id: string) => `/api/chats/${id}/messages`,
  CHAT_GENERATE: (id: string) => `/api/chats/${id}/generate`,
  CHAT_REGENERATE: (id: string) => `/api/chats/${id}/regenerate`,
  CHAT_BRANCHES: (id: string) => `/api/chats/${id}/branches`,
  CHAT_BRANCH_BY_ID: (chatId: string, branchId: string) => `/api/chats/${chatId}/branches/${branchId}`,
  CHAT_EXPORT: (id: string) => `/api/chats/${id}/export`,
  CHAT_IMPORT: '/api/chats/import',

  // Character endpoints
  CHARACTERS: '/api/characters',
  CHARACTER_BY_ID: (id: string) => `/api/characters/${id}`,
  CHARACTER_IMPORT: '/api/characters/import',
  CHARACTER_EXPORT: (id: string) => `/api/characters/${id}/export`,
  CHARACTER_AVATAR: (id: string) => `/api/characters/${id}/avatar`,
  CHARACTER_SEARCH: '/api/characters/search',
  CHARACTER_DUPLICATE: (id: string) => `/api/characters/${id}/duplicate`,

  // AI Model endpoints
  AI_MODELS: '/api/ai-models',
  AI_MODEL_BY_ID: (id: string) => `/api/ai-models/${id}`,
  AI_MODEL_TEST: (id: string) => `/api/ai-models/${id}/test`,
  AI_MODEL_PROVIDERS: '/api/ai-models/providers',
  AI_MODEL_INFO: (provider: string, model: string) => `/api/ai-models/${provider}/${model}/info`,

  // World Info endpoints
  WORLD_INFO: '/api/world-info',
  WORLD_INFO_BY_ID: (id: string) => `/api/world-info/${id}`,
  WORLD_INFO_SEARCH: '/api/world-info/search',
  WORLD_INFO_VECTOR_SEARCH: '/api/world-info/vector-search',
  WORLD_INFO_EXPORT: '/api/world-info/export',
  WORLD_INFO_IMPORT: '/api/world-info/import',
  WORLD_INFO_CATEGORIES: '/api/world-info/categories',

  // Plugin endpoints
  PLUGINS: '/api/plugins',
  PLUGIN_BY_ID: (id: string) => `/api/plugins/${id}`,
  PLUGIN_INSTALL: '/api/plugins/install',
  PLUGIN_UNINSTALL: (id: string) => `/api/plugins/${id}/uninstall`,
  PLUGIN_ENABLE: (id: string) => `/api/plugins/${id}/enable`,
  PLUGIN_DISABLE: (id: string) => `/api/plugins/${id}/disable`,
  PLUGIN_CONFIG: (id: string) => `/api/plugins/${id}/config`,
  PLUGIN_HOOKS: '/api/plugins/hooks',
  PLUGIN_MARKETPLACE: '/api/plugins/marketplace',
  PLUGIN_REPOSITORIES: '/api/plugins/repositories',

  // Settings endpoints
  SETTINGS: '/api/settings',
  SETTINGS_UI: '/api/settings/ui',
  SETTINGS_AI: '/api/settings/ai',
  SETTINGS_PRIVACY: '/api/settings/privacy',
  SETTINGS_EXPORT: '/api/settings/export',
  SETTINGS_IMPORT: '/api/settings/import',

  // File endpoints
  FILES_UPLOAD: '/api/files/upload',
  FILE_BY_ID: (id: string) => `/api/files/${id}`,
  FILES_AVATARS: '/api/files/avatars',
  FILES_BACKGROUNDS: '/api/files/backgrounds',
  FILES_EXPORTS: '/api/files/exports',

  // Analytics endpoints
  ANALYTICS_EVENTS: '/api/analytics/events',
  ANALYTICS_METRICS: '/api/analytics/metrics',
  ANALYTICS_USAGE: '/api/analytics/usage',

  // System endpoints
  SYSTEM_HEALTH: '/api/system/health',
  SYSTEM_INFO: '/api/system/info',
  SYSTEM_LOGS: '/api/system/logs',
  SYSTEM_BACKUP: '/api/system/backup',
  SYSTEM_RESTORE: '/api/system/restore',

  // Authentication endpoints (future)
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_PROFILE: '/api/auth/profile',
  AUTH_PASSWORD: '/api/auth/password',
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

// Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// API Headers
export const API_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  USER_AGENT: 'User-Agent',
  X_REQUEST_ID: 'X-Request-ID',
  X_API_VERSION: 'X-API-Version',
  X_CLIENT_VERSION: 'X-Client-Version',
} as const;

// Content types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html',
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  GIF: 'image/gif',
  SVG: 'image/svg+xml',
} as const;

// API version
export const API_VERSION = 'v1';

// Request timeout in milliseconds
export const API_TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  UPLOAD: 300000, // 5 minutes
  GENERATION: 120000, // 2 minutes
  DOWNLOAD: 60000, // 1 minute
  QUICK: 5000, // 5 seconds
} as const;

// Rate limits
export const RATE_LIMITS = {
  DEFAULT: 100, // requests per minute
  GENERATION: 20, // requests per minute
  UPLOAD: 10, // requests per minute
  SEARCH: 30, // requests per minute
} as const;

// Cache durations in seconds
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAILY: 86400, // 24 hours
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;