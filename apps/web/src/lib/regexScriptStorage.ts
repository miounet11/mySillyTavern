/**
 * LocalStorage utilities for regex scripts management
 */

import { RegexScript } from './defaultRegexRules'

const STORAGE_KEY = 'regex_scripts'

/**
 * Get all regex scripts from localStorage
 */
export function getRegexScripts(): RegexScript[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const scripts = JSON.parse(stored)
    return Array.isArray(scripts) ? scripts : []
  } catch (error) {
    console.error('Error reading regex scripts from localStorage:', error)
    return []
  }
}

/**
 * Save regex scripts to localStorage
 */
export function saveRegexScripts(scripts: RegexScript[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts))
  } catch (error) {
    console.error('Error saving regex scripts to localStorage:', error)
  }
}

/**
 * Get enabled display scripts sorted by priority
 */
export function getActiveDisplayScripts(): RegexScript[] {
  const scripts = getRegexScripts()
  
  return scripts
    .filter(script => 
      script.enabled && 
      (script.scriptType === 'display' || script.scriptType === 'all')
    )
    .sort((a, b) => b.priority - a.priority) // Higher priority first
}

/**
 * Apply regex scripts to content
 */
export function applyRegexScripts(content: string, scripts?: RegexScript[]): string {
  if (!content) return ''
  
  const activeScripts = scripts || getActiveDisplayScripts()
  let result = content
  
  for (const script of activeScripts) {
    try {
      // Extract flags from regex string if present
      const regexMatch = script.findRegex.match(/^\/(.+)\/([gimsuvy]*)$/)
      let pattern: string
      let flags: string
      
      if (regexMatch) {
        pattern = regexMatch[1]
        flags = regexMatch[2] || ''
      } else {
        pattern = script.findRegex
        flags = 'g' // Default to global flag
      }
      
      const regex = new RegExp(pattern, flags)
      result = result.replace(regex, script.replaceWith)
    } catch (error) {
      console.error(`Error applying regex script "${script.name}":`, error)
    }
  }
  
  return result
}

/**
 * Add a new regex script
 */
export function addRegexScript(script: RegexScript): void {
  const scripts = getRegexScripts()
  scripts.push(script)
  saveRegexScripts(scripts)
}

/**
 * Update an existing regex script
 */
export function updateRegexScript(id: string, updates: Partial<RegexScript>): void {
  const scripts = getRegexScripts()
  const index = scripts.findIndex(s => s.id === id)
  
  if (index !== -1) {
    scripts[index] = { ...scripts[index], ...updates }
    saveRegexScripts(scripts)
  }
}

/**
 * Delete a regex script
 */
export function deleteRegexScript(id: string): void {
  const scripts = getRegexScripts()
  const filtered = scripts.filter(s => s.id !== id)
  saveRegexScripts(filtered)
}

/**
 * Toggle script enabled status
 */
export function toggleRegexScript(id: string): void {
  const scripts = getRegexScripts()
  const script = scripts.find(s => s.id === id)
  
  if (script) {
    script.enabled = !script.enabled
    saveRegexScripts(scripts)
  }
}

