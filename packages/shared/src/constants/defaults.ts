/**
 * Default values and constants
 */

// Application defaults
export const APP_DEFAULTS = {
  NAME: 'SillyTavern Perfect Clone',
  VERSION: '1.0.0',
  DESCRIPTION: 'Perfect clone of SillyTavern AI chat interface with enhanced features',
  HOMEPAGE: 'https://sillytavern-clone.com',
  REPOSITORY: 'https://github.com/your-org/sillytavern-perfect-clone',
} as const;

// Chat defaults
export const CHAT_DEFAULTS = {
  TITLE: 'New Chat',
  MAX_TITLE_LENGTH: 100,
  MAX_MESSAGE_LENGTH: 32000,
  MAX_MESSAGES_PER_CHAT: 1000,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  TYPING_INDICATOR_DELAY: 1000, // 1 second
  GENERATION_TIMEOUT: 120000, // 2 minutes
} as const;

// Character defaults
export const CHARACTER_DEFAULTS = {
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_PERSONALITY_LENGTH: 1000,
  MAX_FIRST_MESSAGE_LENGTH: 500,
  MAX_BACKGROUND_LENGTH: 2000,
  MAX_EXAMPLE_MESSAGES: 10,
  MAX_TAGS: 20,
  AVATAR_SIZE: { WIDTH: 400, HEIGHT: 400 },
  DEFAULT_AVATAR: '/images/default-avatar.png',
} as const;

// AI Model defaults
export const AI_MODEL_DEFAULTS = {
  TEMPERATURE: 0.7,
  MAX_TOKENS: 2000,
  TOP_P: 1.0,
  FREQUENCY_PENALTY: 0.0,
  PRESENCE_PENALTY: 0.0,
  CONTEXT_WINDOW: 4096,
  MAX_RESPONSE_TOKENS: 1000,
  TIMEOUT: 60000, // 1 minute
  MAX_RETRIES: 3,
} as const;

// World Info defaults
export const WORLD_INFO_DEFAULTS = {
  MAX_NAME_LENGTH: 100,
  MAX_CONTENT_LENGTH: 5000,
  MAX_KEYWORDS: 20,
  MAX_KEYWORD_LENGTH: 50,
  MAX_PRIORITY: 100,
  DEFAULT_PRIORITY: 0,
  SIMILARITY_THRESHOLD: 0.7,
  MAX_ACTIVATIONS_PER_REQUEST: 10,
  MIN_KEYWORD_LENGTH: 2,
  CASE_SENSITIVE: false,
  WHOLE_WORDS_ONLY: false,
} as const;

// Plugin defaults
export const PLUGIN_DEFAULTS = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_CONFIG_SIZE: 10000, // characters
  MAX_DEPENDENCIES: 20,
  TIMEOUT: 30000, // 30 seconds
  MAX_MEMORY_USAGE: 512 * 1024 * 1024, // 512MB
} as const;

// UI defaults
export const UI_DEFAULTS = {
  THEME: 'dark',
  LANGUAGE: 'en',
  FONT_SIZE: 'medium',
  SIDEBAR_WIDTH: 320,
  MIN_SIDEBAR_WIDTH: 240,
  MAX_SIDEBAR_WIDTH: 480,
  MESSAGE_ANIMATION_DURATION: 300,
  TOAST_DURATION: 4000,
  MODAL_ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  TYPING_ANIMATION_DURATION: 1000,
} as const;

// File upload defaults
export const FILE_DEFAULTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  BACKGROUND_MAX_SIZE: 20 * 1024 * 1024, // 20MB
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  SUPPORTED_DOCUMENT_FORMATS: ['text/plain', 'application/json', 'text/html'],
  AVATAR_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  BACKGROUND_FORMATS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;

// Validation defaults
export const VALIDATION_DEFAULTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  REFRESH_TOKEN_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

// Performance defaults
export const PERFORMANCE_DEFAULTS = {
  BATCH_SIZE: 50,
  MAX_CONCURRENT_REQUESTS: 10,
  CACHE_SIZE: 1000,
  INDEX_PAGE_SIZE: 50,
  SEARCH_RESULTS_LIMIT: 100,
  AUTOSAVE_DEBOUNCE: 5000, // 5 seconds
  PRELOAD_TIMEOUT: 10000, // 10 seconds
} as const;

// Development defaults
export const DEVELOPMENT_DEFAULTS = {
  HOT_RELOAD_DELAY: 1000,
  LOG_LEVEL: 'info',
  DEBUG_MODE: false,
  SHOW_PERFORMANCE_METRICS: false,
  ENABLE_ANALYTICS: false,
} as const;

// Security defaults
export const SECURITY_DEFAULTS = {
  MIN_PASSWORD_STRENGTH: 3,
  MAX_LOGIN_ATTEMPTS: 5,
  SESSION_TIMEOUT: 3600000, // 1 hour
  CSRF_TOKEN_EXPIRY: 3600000, // 1 hour
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 100,
} as const;

// Export limits
export const EXPORT_DEFAULTS = {
  MAX_MESSAGES_PER_EXPORT: 10000,
  MAX_CHARACTERS_PER_EXPORT: 1000,
  MAX_WORLD_INFO_PER_EXPORT: 500,
  COMPRESSION_THRESHOLD: 1024 * 1024, // 1MB
  SUPPORTED_FORMATS: ['json', 'txt', 'html', 'csv'],
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1280,
  ULTRA_WIDE: 1536,
} as const;

// Z-index layers
export const Z_INDEX = {
  BASE: 0,
  DROPDOWN: 10,
  STICKY: 20,
  MODAL: 30,
  POPOVER: 40,
  TOOLTIP: 50,
  NOTIFICATION: 60,
  LOADING: 70,
  MAX: 100,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_SETTINGS: 'user_settings',
  THEME: 'theme',
  LANGUAGE: 'language',
  LAST_ACTIVE_CHAT: 'last_active_chat',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  AI_MODEL_PREFERENCES: 'ai_model_preferences',
  PLUGIN_SETTINGS: 'plugin_settings',
  WORLD_INFO_CACHE: 'world_info_cache',
} as const;

// Error codes
export const ERROR_CODES = {
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',

  // AI model errors
  AI_MODEL_ERROR: 'AI_MODEL_ERROR',
  AI_QUOTA_EXCEEDED: 'AI_QUOTA_EXCEEDED',
  AI_MODEL_UNAVAILABLE: 'AI_MODEL_UNAVAILABLE',
  INVALID_API_KEY: 'INVALID_API_KEY',

  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
  UPLOAD_FAILED: 'UPLOAD_FAILED',

  // Plugin errors
  PLUGIN_ERROR: 'PLUGIN_ERROR',
  PLUGIN_NOT_FOUND: 'PLUGIN_NOT_FOUND',
  PLUGIN_INCOMPATIBLE: 'PLUGIN_INCOMPATIBLE',
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy h:mm a',
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy h:mm:ss a',
  ISO: 'yyyy-MM-dd HH:mm:ss',
  FILE_NAME: 'yyyy-MM-dd_HH-mm-ss',
} as const;