/**
 * Unit tests for model presets
 */

import { describe, it, expect } from 'vitest'
import {
  getModelPresetsForProvider,
  getRecommendedModels,
  findModelPreset,
  MODEL_PRESETS,
} from '../model-presets'

describe('Model Presets', () => {
  describe('getModelPresetsForProvider', () => {
    it('should return presets for OpenAI', () => {
      const presets = getModelPresetsForProvider('openai')
      expect(presets.length).toBeGreaterThan(0)
      expect(presets.every(p => p.provider === 'openai')).toBe(true)
    })

    it('should return presets for Anthropic', () => {
      const presets = getModelPresetsForProvider('anthropic')
      expect(presets.length).toBeGreaterThan(0)
      expect(presets.every(p => p.provider === 'anthropic')).toBe(true)
    })

    it('should return empty array for unknown provider', () => {
      const presets = getModelPresetsForProvider('unknown-provider')
      expect(presets).toEqual([])
    })
  })

  describe('getRecommendedModels', () => {
    it('should return only recommended models', () => {
      const recommended = getRecommendedModels()
      expect(recommended.length).toBeGreaterThan(0)
      expect(recommended.every(p => p.isRecommended === true)).toBe(true)
    })

    it('should include models from multiple providers', () => {
      const recommended = getRecommendedModels()
      const providers = new Set(recommended.map(p => p.provider))
      expect(providers.size).toBeGreaterThan(1)
    })
  })

  describe('findModelPreset', () => {
    it('should find GPT-4o preset', () => {
      const preset = findModelPreset('openai', 'gpt-4o')
      expect(preset).toBeDefined()
      expect(preset?.name).toBe('gpt-4o')
      expect(preset?.provider).toBe('openai')
    })

    it('should find Claude 3.5 Sonnet preset', () => {
      const preset = findModelPreset('anthropic', 'claude-3-5-sonnet-20241022')
      expect(preset).toBeDefined()
      expect(preset?.displayName).toBe('Claude 3.5 Sonnet')
    })

    it('should return undefined for non-existent model', () => {
      const preset = findModelPreset('openai', 'non-existent-model')
      expect(preset).toBeUndefined()
    })

    it('should return undefined for unknown provider', () => {
      const preset = findModelPreset('unknown', 'gpt-4o')
      expect(preset).toBeUndefined()
    })
  })

  describe('MODEL_PRESETS structure', () => {
    it('should have valid structure for all presets', () => {
      Object.entries(MODEL_PRESETS).forEach(([provider, presets]) => {
        presets.forEach((preset) => {
          // Required fields
          expect(preset.id).toBeDefined()
          expect(preset.name).toBeDefined()
          expect(preset.displayName).toBeDefined()
          expect(preset.provider).toBe(provider)

          // Capabilities
          expect(preset.capabilities).toBeDefined()
          expect(typeof preset.capabilities.streaming).toBe('boolean')
          expect(typeof preset.capabilities.vision).toBe('boolean')
          expect(typeof preset.capabilities.tools).toBe('boolean')

          // Metadata
          expect(preset.metadata).toBeDefined()
          expect(preset.metadata.inputWindow).toBeGreaterThan(0)
          expect(preset.metadata.outputWindow).toBeGreaterThan(0)
        })
      })
    })

    it('should have at least one preset per major provider', () => {
      const majorProviders = ['openai', 'anthropic', 'google']
      majorProviders.forEach((provider) => {
        expect(MODEL_PRESETS[provider]).toBeDefined()
        expect(MODEL_PRESETS[provider].length).toBeGreaterThan(0)
      })
    })
  })

  describe('Model capabilities', () => {
    it('should correctly identify vision models', () => {
      const gpt4o = findModelPreset('openai', 'gpt-4o')
      expect(gpt4o?.capabilities.vision).toBe(true)

      const o1 = findModelPreset('openai', 'o1-preview')
      expect(o1?.capabilities.vision).toBe(false)
    })

    it('should correctly identify reasoning models', () => {
      const o1 = findModelPreset('openai', 'o1-preview')
      expect(o1?.metadata.isReasoning).toBe(true)

      const gpt4o = findModelPreset('openai', 'gpt-4o')
      expect(gpt4o?.metadata.isReasoning).toBe(false)
    })
  })
})

