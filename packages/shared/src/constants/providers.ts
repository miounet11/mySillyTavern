/**
 * AI Provider Metadata Configuration
 * Central configuration for all supported AI providers
 */

import { AIProvider } from '../types/ai-model'

export interface ProviderInfo {
  name: string
  displayName: string
  icon: string
  color: string
  defaultBaseUrl?: string
  requiresApiKey: boolean
  description?: string
}

export const PROVIDER_INFO: Record<AIProvider, ProviderInfo> = {
  openai: {
    name: 'openai',
    displayName: 'OpenAI',
    icon: '/assets/providers/openai.svg',
    color: '#10a37f',
    defaultBaseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    description: 'ChatGPT and GPT models from OpenAI',
  },
  anthropic: {
    name: 'anthropic',
    displayName: 'Anthropic',
    icon: '/assets/providers/claude.svg',
    color: '#d97757',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    requiresApiKey: true,
    description: 'Claude models from Anthropic',
  },
  google: {
    name: 'google',
    displayName: 'Google',
    icon: '/assets/providers/gemini.svg',
    color: '#4285f4',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    requiresApiKey: true,
    description: 'Gemini models from Google',
  },
  azure: {
    name: 'azure',
    displayName: 'Azure OpenAI',
    icon: '/assets/providers/azure.svg',
    color: '#0078d4',
    requiresApiKey: true,
    description: 'OpenAI models hosted on Azure',
  },
  deepseek: {
    name: 'deepseek',
    displayName: 'DeepSeek',
    icon: '/assets/providers/deepseek.svg',
    color: '#6366f1',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    requiresApiKey: true,
    description: 'DeepSeek AI models (深度求索)',
  },
  zhipu: {
    name: 'zhipu',
    displayName: '智谱 AI',
    icon: '/assets/providers/zhipu.svg',
    color: '#3b82f6',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    requiresApiKey: true,
    description: 'GLM models from Zhipu AI (智谱清言)',
  },
  custom: {
    name: 'custom',
    displayName: 'Custom OpenAI',
    icon: '/assets/providers/custom.svg',
    color: '#8b5cf6',
    requiresApiKey: true,
    description: 'Custom OpenAI-compatible API endpoint',
  },
  local: {
    name: 'local',
    displayName: 'Local AI',
    icon: '/assets/providers/local.png',
    color: '#22c55e',
    requiresApiKey: false,
    description: 'Locally hosted AI models',
  },
  kobold: {
    name: 'kobold',
    displayName: 'KoboldAI',
    icon: '/assets/providers/kobold.png',
    color: '#ec4899',
    requiresApiKey: false,
    description: 'KoboldAI backend',
  },
  ooba: {
    name: 'ooba',
    displayName: 'Text Gen WebUI',
    icon: '/assets/providers/ooba.png',
    color: '#f59e0b',
    requiresApiKey: false,
    description: 'Oobabooga Text Generation WebUI',
  },
  novelai: {
    name: 'novelai',
    displayName: 'NovelAI',
    icon: '/assets/providers/novelai.png',
    color: '#8b5cf6',
    requiresApiKey: true,
    description: 'NovelAI story generation',
  },
  horde: {
    name: 'horde',
    displayName: 'AI Horde',
    icon: '/assets/providers/horde.png',
    color: '#06b6d4',
    requiresApiKey: false,
    description: 'Distributed AI model cluster',
  },
  newapi: {
    name: 'newapi',
    displayName: 'New API',
    icon: '/assets/providers/newapi.png',
    color: '#64748b',
    requiresApiKey: true,
    description: 'New API gateway service',
  },
}

// Provider groups for UI organization
export const PROVIDER_GROUPS = {
  mainstream: ['openai', 'anthropic', 'google', 'azure'] as AIProvider[],
  chinese: ['deepseek', 'zhipu'] as AIProvider[],
  custom: ['custom', 'local', 'kobold', 'ooba'] as AIProvider[],
  other: ['novelai', 'horde', 'newapi'] as AIProvider[],
}

// Get provider info helper
export function getProviderInfo(provider: AIProvider): ProviderInfo {
  return PROVIDER_INFO[provider]
}

// Get all mainstream providers
export function getMainstreamProviders(): AIProvider[] {
  return PROVIDER_GROUPS.mainstream
}

// Get all providers in order
export function getAllProvidersOrdered(): AIProvider[] {
  return [
    ...PROVIDER_GROUPS.mainstream,
    ...PROVIDER_GROUPS.chinese,
    ...PROVIDER_GROUPS.custom,
    ...PROVIDER_GROUPS.other,
  ]
}

