/**
 * AI Model Presets - Pre-configured model metadata for popular models
 */

import { ModelCapabilities, ModelMetadata } from '../types/ai-model'

export interface ModelPreset {
  id: string
  name: string
  displayName: string
  provider: string
  capabilities: ModelCapabilities
  metadata: ModelMetadata
  description?: string
  isRecommended?: boolean
}

export const MODEL_PRESETS: Record<string, ModelPreset[]> = {
  openai: [
    {
      id: 'gpt-4o',
      name: 'gpt-4o',
      displayName: 'GPT-4o',
      provider: 'openai',
      capabilities: {
        streaming: true,
        images: true,
        tools: true,
        vision: true,
        audio: false,
      },
      metadata: {
        inputWindow: 128000,
        outputWindow: 16384,
        displayName: 'GPT-4o',
        description: 'Most advanced multimodal model with vision and tool support',
        isReasoning: false,
      },
      isRecommended: true,
    },
    {
      id: 'gpt-4o-mini',
      name: 'gpt-4o-mini',
      displayName: 'GPT-4o Mini',
      provider: 'openai',
      capabilities: {
        streaming: true,
        images: true,
        tools: true,
        vision: true,
        audio: false,
      },
      metadata: {
        inputWindow: 128000,
        outputWindow: 16384,
        displayName: 'GPT-4o Mini',
        description: 'Fast and cost-effective model with vision support',
        isReasoning: false,
      },
      isRecommended: true,
    },
    {
      id: 'gpt-4-turbo',
      name: 'gpt-4-turbo',
      displayName: 'GPT-4 Turbo',
      provider: 'openai',
      capabilities: {
        streaming: true,
        images: true,
        tools: true,
        vision: true,
        audio: false,
      },
      metadata: {
        inputWindow: 128000,
        outputWindow: 4096,
        displayName: 'GPT-4 Turbo',
        description: 'High-performance model with vision and tool calling',
        isReasoning: false,
      },
    },
    {
      id: 'gpt-4',
      name: 'gpt-4',
      displayName: 'GPT-4',
      provider: 'openai',
      capabilities: {
        streaming: true,
        images: false,
        tools: true,
        vision: false,
        audio: false,
      },
      metadata: {
        inputWindow: 8192,
        outputWindow: 8192,
        displayName: 'GPT-4',
        description: 'Original GPT-4 model',
        isReasoning: false,
      },
    },
    {
      id: 'o1-preview',
      name: 'o1-preview',
      displayName: 'o1 Preview',
      provider: 'openai',
      capabilities: {
        streaming: false,
        images: false,
        tools: false,
        vision: false,
        audio: false,
      },
      metadata: {
        inputWindow: 128000,
        outputWindow: 32768,
        displayName: 'o1 Preview',
        description: 'Advanced reasoning model for complex tasks',
        isReasoning: true,
      },
      isRecommended: true,
    },
    {
      id: 'o1-mini',
      name: 'o1-mini',
      displayName: 'o1 Mini',
      provider: 'openai',
      capabilities: {
        streaming: false,
        images: false,
        tools: false,
        vision: false,
        audio: false,
      },
      metadata: {
        inputWindow: 128000,
        outputWindow: 65536,
        displayName: 'o1 Mini',
        description: 'Faster reasoning model',
        isReasoning: true,
      },
    },
  ],

  anthropic: [
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'claude-3-5-sonnet-20241022',
      displayName: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      capabilities: {
        streaming: true,
        images: true,
        tools: true,
        vision: true,
        audio: false,
      },
      metadata: {
        inputWindow: 200000,
        outputWindow: 8192,
        displayName: 'Claude 3.5 Sonnet',
        description: 'Most intelligent Claude model with vision and tools',
        isReasoning: false,
      },
      isRecommended: true,
    },
    {
      id: 'claude-3-opus-20240229',
      name: 'claude-3-opus-20240229',
      displayName: 'Claude 3 Opus',
      provider: 'anthropic',
      capabilities: {
        streaming: true,
        images: true,
        tools: true,
        vision: true,
        audio: false,
      },
      metadata: {
        inputWindow: 200000,
        outputWindow: 4096,
        displayName: 'Claude 3 Opus',
        description: 'Most capable Claude 3 model',
        isReasoning: false,
      },
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'claude-3-sonnet-20240229',
      displayName: 'Claude 3 Sonnet',
      provider: 'anthropic',
      capabilities: {
        streaming: true,
        images: true,
        tools: true,
        vision: true,
        audio: false,
      },
      metadata: {
        inputWindow: 200000,
        outputWindow: 4096,
        displayName: 'Claude 3 Sonnet',
        description: 'Balanced performance and cost',
        isReasoning: false,
      },
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'claude-3-haiku-20240307',
      displayName: 'Claude 3 Haiku',
      provider: 'anthropic',
      capabilities: {
        streaming: true,
        images: true,
        tools: true,
        vision: true,
        audio: false,
      },
      metadata: {
        inputWindow: 200000,
        outputWindow: 4096,
        displayName: 'Claude 3 Haiku',
        description: 'Fast and cost-effective model',
        isReasoning: false,
      },
    },
  ],

  google: [
    {
      id: 'gemini-2.0-flash-exp',
      name: 'gemini-2.0-flash-exp',
      displayName: 'Gemini 2.0 Flash',
      provider: 'google',
      capabilities: {
        streaming: true,
        images: true,
        tools: true,
        vision: true,
        audio: true,
      },
      metadata: {
        inputWindow: 1000000,
        outputWindow: 8192,
        displayName: 'Gemini 2.0 Flash',
        description: 'Latest experimental multimodal model',
        isReasoning: false,
      },
      isRecommended: true,
    },
    {
      id: 'gemini-1.5-pro',
      name: 'gemini-1.5-pro',
      displayName: 'Gemini 1.5 Pro',
      provider: 'google',
      capabilities: {
        streaming: true,
        images: true,
        tools: true,
        vision: true,
        audio: true,
      },
      metadata: {
        inputWindow: 2000000,
        outputWindow: 8192,
        displayName: 'Gemini 1.5 Pro',
        description: 'Largest context window, multimodal support',
        isReasoning: false,
      },
      isRecommended: true,
    },
    {
      id: 'gemini-1.5-flash',
      name: 'gemini-1.5-flash',
      displayName: 'Gemini 1.5 Flash',
      provider: 'google',
      capabilities: {
        streaming: true,
        images: true,
        tools: true,
        vision: true,
        audio: false,
      },
      metadata: {
        inputWindow: 1000000,
        outputWindow: 8192,
        displayName: 'Gemini 1.5 Flash',
        description: 'Fast and efficient model',
        isReasoning: false,
      },
    },
  ],

  deepseek: [
    {
      id: 'deepseek-chat',
      name: 'deepseek-chat',
      displayName: 'DeepSeek Chat',
      provider: 'deepseek',
      capabilities: {
        streaming: true,
        images: false,
        tools: true,
        vision: false,
        audio: false,
      },
      metadata: {
        inputWindow: 64000,
        outputWindow: 8192,
        displayName: 'DeepSeek Chat',
        description: '高性能对话模型',
        isReasoning: false,
      },
      isRecommended: true,
    },
    {
      id: 'deepseek-coder',
      name: 'deepseek-coder',
      displayName: 'DeepSeek Coder',
      provider: 'deepseek',
      capabilities: {
        streaming: true,
        images: false,
        tools: true,
        vision: false,
        audio: false,
      },
      metadata: {
        inputWindow: 64000,
        outputWindow: 8192,
        displayName: 'DeepSeek Coder',
        description: '专业代码生成模型',
        isReasoning: false,
      },
    },
  ],

  zhipu: [
    {
      id: 'glm-4-plus',
      name: 'glm-4-plus',
      displayName: 'GLM-4 Plus',
      provider: 'zhipu',
      capabilities: {
        streaming: true,
        images: true,
        tools: true,
        vision: true,
        audio: false,
      },
      metadata: {
        inputWindow: 128000,
        outputWindow: 8192,
        displayName: 'GLM-4 Plus',
        description: '智谱 AI 旗舰模型，支持多模态',
        isReasoning: false,
      },
      isRecommended: true,
    },
    {
      id: 'glm-4',
      name: 'glm-4',
      displayName: 'GLM-4',
      provider: 'zhipu',
      capabilities: {
        streaming: true,
        images: false,
        tools: true,
        vision: false,
        audio: false,
      },
      metadata: {
        inputWindow: 128000,
        outputWindow: 8192,
        displayName: 'GLM-4',
        description: '通用对话模型',
        isReasoning: false,
      },
    },
  ],

  azure: [
    {
      id: 'gpt-4o',
      name: 'gpt-4o',
      displayName: 'GPT-4o (Azure)',
      provider: 'azure',
      capabilities: {
        streaming: true,
        images: true,
        tools: true,
        vision: true,
        audio: false,
      },
      metadata: {
        inputWindow: 128000,
        outputWindow: 16384,
        displayName: 'GPT-4o (Azure)',
        description: 'Azure hosted GPT-4o',
        isReasoning: false,
      },
      isRecommended: true,
    },
  ],
}

// Get presets for a specific provider
export function getModelPresetsForProvider(provider: string): ModelPreset[] {
  return MODEL_PRESETS[provider] || []
}

// Get all recommended models across providers
export function getRecommendedModels(): ModelPreset[] {
  return Object.values(MODEL_PRESETS)
    .flat()
    .filter((preset) => preset.isRecommended)
}

// Find a preset by model name and provider
export function findModelPreset(provider: string, modelName: string): ModelPreset | undefined {
  const presets = MODEL_PRESETS[provider] || []
  return presets.find((preset) => preset.name === modelName)
}

