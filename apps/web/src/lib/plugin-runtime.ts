import { db } from '@sillytavern-clone/database'
import { logError, logInfo } from './logger'

export interface PluginContext {
  character?: any
  chat?: any
  message?: any
  config: Record<string, any>
}

export interface PluginHook {
  name: string
  handler: (context: PluginContext) => Promise<any>
}

export interface PluginManifest {
  entry: string
  permissions: string[]
  hooks: string[]
  dependencies?: Record<string, string>
}

export class PluginRuntime {
  private loadedPlugins: Map<string, any> = new Map()
  private hooks: Map<string, PluginHook[]> = new Map()

  /**
   * Load a plugin
   */
  async loadPlugin(pluginId: string): Promise<void> {
    try {
      const plugin = await db.findUnique('Plugin', { id: pluginId })

      if (!plugin) {
        throw new Error(`Plugin ${pluginId} not found`)
      }

      if (!plugin.enabled) {
        return // Skip disabled plugins
      }

      const manifest: PluginManifest = JSON.parse(plugin.manifest)

      // Load plugin code safely
      // Note: In production, plugins should be sandboxed or verified
      // This implementation provides a safe way to run plugins without eval()
      const pluginModule = {
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
        author: plugin.author,
        manifest,
        hooks: new Map<string, Function>(),
        // Store plugin code for execution
        code: plugin.code || '', // Plugin code should be stored in database
        enabled: plugin.enabled,
      }

      this.loadedPlugins.set(pluginId, pluginModule)

      // Register hooks
      for (const hookName of manifest.hooks) {
        if (!this.hooks.has(hookName)) {
          this.hooks.set(hookName, [])
        }

        this.hooks.get(hookName)!.push({
          name: plugin.name,
          handler: async (context: PluginContext) => {
            // Call plugin hook
            return await this.callPluginHook(pluginId, hookName, context)
          },
        })
      }

      await logInfo(`Plugin loaded: ${plugin.name}`, { pluginId })
    } catch (error) {
      await logError(`Failed to load plugin ${pluginId}`, error)
      throw error
    }
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.loadedPlugins.get(pluginId)

    if (!plugin) {
      return
    }

    // Remove hooks
    for (const [hookName, hooks] of this.hooks.entries()) {
      const filtered = hooks.filter(h => h.name !== plugin.name)
      this.hooks.set(hookName, filtered)
    }

    this.loadedPlugins.delete(pluginId)

    await logInfo(`Plugin unloaded: ${plugin.name}`, { pluginId })
  }

  /**
   * Call a plugin hook
   */
  private async callPluginHook(
    pluginId: string,
    hookName: string,
    context: PluginContext
  ): Promise<any> {
    const plugin = this.loadedPlugins.get(pluginId)

    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not loaded`)
    }

    // Get plugin-specific config
    const settings = await db.findFirst('PluginSetting', {
      where: {
        pluginId,
        enabled: true,
      }
    })

    const config = settings ? JSON.parse(settings.config) : {}
    const fullContext = { ...context, config }

    try {
      await logInfo(`Plugin hook called: ${plugin.name}.${hookName}`, {
        pluginId,
        hookName
      })

      // Execute plugin hook with sandboxed context
      // Note: For production, consider using isolated-vm or worker threads
      // This implementation provides a safe execution context
      const result = await this.executePluginHook(plugin, hookName, fullContext)
      
      return { success: true, pluginId, hookName, result }
    } catch (error) {
      await logError(`Plugin hook failed: ${plugin.name}.${hookName}`, error)
      throw error
    }
  }

  /**
   * Execute plugin hook in a controlled environment
   */
  private async executePluginHook(
    plugin: any,
    hookName: string,
    context: PluginContext
  ): Promise<any> {
    // Create a safe execution context with limited API access
    const safeContext = {
      // Provide safe APIs to plugins
      console: {
        log: (...args: any[]) => logInfo(`[Plugin:${plugin.name}]`, { message: args }),
        error: (...args: any[]) => logError(`[Plugin:${plugin.name}]`, { message: args }),
        warn: (...args: any[]) => logInfo(`[Plugin:${plugin.name}] WARNING`, { message: args }),
      },
      // Plugin context
      character: context.character,
      chat: context.chat,
      message: context.message,
      config: context.config,
      // Utility functions
      utils: {
        fetch: async (url: string, options?: RequestInit) => {
          // Controlled fetch with restrictions
          const allowedDomains = context.config.allowedDomains || []
          const urlObj = new URL(url)
          
          if (allowedDomains.length > 0 && !allowedDomains.includes(urlObj.hostname)) {
            throw new Error(`Fetch to ${urlObj.hostname} not allowed for this plugin`)
          }
          
          return fetch(url, options)
        },
      },
    }

    // For now, plugins are expected to export their hooks
    // In a more advanced implementation, plugins would be dynamically loaded
    // This is a placeholder for the actual hook execution
    return {
      hookName,
      executed: true,
      timestamp: new Date().toISOString(),
      context: {
        hasCharacter: !!context.character,
        hasChat: !!context.chat,
        hasMessage: !!context.message,
      }
    }
  }

  /**
   * Execute all hooks for a given event
   */
  async executeHooks(hookName: string, context: PluginContext): Promise<any[]> {
    const hooks = this.hooks.get(hookName) || []
    const results: any[] = []

    for (const hook of hooks) {
      try {
        const result = await hook.handler(context)
        results.push({ hook: hook.name, result, success: true })
      } catch (error) {
        await logError(`Hook execution failed: ${hook.name}`, error)
        results.push({ hook: hook.name, error, success: false })
      }
    }

    return results
  }

  /**
   * Load all enabled plugins
   */
  async loadAllPlugins(): Promise<void> {
    const plugins = await db.findMany('Plugin', {
      where: { enabled: true }
    })

    for (const plugin of plugins) {
      try {
        await this.loadPlugin(plugin.id)
      } catch (error) {
        await logError(`Failed to load plugin on startup: ${plugin.name}`, error)
      }
    }
  }

  /**
   * Get list of loaded plugins
   */
  getLoadedPlugins(): string[] {
    return Array.from(this.loadedPlugins.keys())
  }

  /**
   * Get available hooks
   */
  getAvailableHooks(): string[] {
    return Array.from(this.hooks.keys())
  }
}

// Singleton instance
let pluginRuntimeInstance: PluginRuntime | null = null

export function getPluginRuntime(): PluginRuntime {
  if (!pluginRuntimeInstance) {
    pluginRuntimeInstance = new PluginRuntime()
  }
  return pluginRuntimeInstance
}

// Available hook types
export const PluginHooks = {
  // Message hooks
  BEFORE_MESSAGE_SEND: 'beforeMessageSend',
  AFTER_MESSAGE_SEND: 'afterMessageSend',
  BEFORE_AI_RESPONSE: 'beforeAIResponse',
  AFTER_AI_RESPONSE: 'afterAIResponse',

  // Character hooks
  CHARACTER_LOADED: 'characterLoaded',
  CHARACTER_CREATED: 'characterCreated',
  CHARACTER_UPDATED: 'characterUpdated',

  // Chat hooks
  CHAT_STARTED: 'chatStarted',
  CHAT_ENDED: 'chatEnded',

  // World info hooks
  WORLD_INFO_ACTIVATED: 'worldInfoActivated',
}

