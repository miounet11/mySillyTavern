import { useEffect, useState } from 'react'

type Locale = 'en' | 'zh-CN' | 'ja'
type TranslationKey = string

interface Translations {
  [key: string]: any
}

class I18n {
  private static instance: I18n
  private currentLocale: Locale = 'zh-CN'
  private translations: Map<Locale, Translations> = new Map()
  private listeners: Set<() => void> = new Set()
  private loadingPromises: Map<Locale, Promise<void>> = new Map()
  private isInitialized: boolean = false

  private constructor() {
    // Load default locale from localStorage or browser
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as Locale
      if (savedLocale) {
        this.currentLocale = savedLocale
      } else {
        const browserLang = navigator.language
        if (browserLang.startsWith('zh')) {
          this.currentLocale = 'zh-CN'
        } else if (browserLang.startsWith('ja')) {
          this.currentLocale = 'ja'
        } else {
          this.currentLocale = 'en'
        }
      }
      // Immediately start loading the initial locale
      this.loadTranslations(this.currentLocale).then(() => {
        this.isInitialized = true
        this.listeners.forEach(listener => listener())
      })
    }
  }

  static getInstance(): I18n {
    if (!I18n.instance) {
      I18n.instance = new I18n()
    }
    return I18n.instance
  }

  async loadTranslations(locale: Locale): Promise<void> {
    // Return existing translation if already loaded
    if (this.translations.has(locale)) {
      return
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(locale)) {
      return this.loadingPromises.get(locale)
    }

    // Create new loading promise
    const loadingPromise = (async () => {
      try {
        const response = await fetch(`/locales/${locale}/common.json`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const translations = await response.json()
        this.translations.set(locale, translations)
      } catch (error) {
        console.error(`Failed to load translations for locale: ${locale}`, error)
        // Fallback to empty object to prevent infinite loading
        this.translations.set(locale, {})
      } finally {
        // Remove from loading promises after completion
        this.loadingPromises.delete(locale)
      }
    })()

    this.loadingPromises.set(locale, loadingPromise)
    return loadingPromise
  }

  getLocale(): Locale {
    return this.currentLocale
  }

  isReady(): boolean {
    return this.isInitialized && this.translations.has(this.currentLocale)
  }

  async waitForInitialization(): Promise<void> {
    if (this.isReady()) {
      return
    }
    
    // Wait for current locale to load
    await this.loadTranslations(this.currentLocale)
  }

  async setLocale(locale: Locale): Promise<void> {
    await this.loadTranslations(locale)
    this.currentLocale = locale
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale)
    }

    // Notify listeners
    this.listeners.forEach(listener => listener())
  }

  t(key: TranslationKey, params?: Record<string, string | number>): string {
    const translations = this.translations.get(this.currentLocale)
    if (!translations) {
      return key
    }

    // Navigate nested keys (e.g., "common.save")
    const keys = key.split('.')
    let value: any = translations
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) {
        return key
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, val]) => {
        value = value.replace(`{{${param}}}`, String(val))
      })
    }

    return value
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}

export const i18n = I18n.getInstance()

// React hook for translations
export function useTranslation() {
  const [isLoading, setIsLoading] = useState(!i18n.isReady())
  const [, setUpdate] = useState(0)

  useEffect(() => {
    // Wait for translations to load
    const initTranslations = async () => {
      if (!i18n.isReady()) {
        await i18n.waitForInitialization()
        setIsLoading(false)
      }
    }

    initTranslations()

    // Subscribe to locale changes
    const unsubscribe = i18n.subscribe(() => {
      setUpdate(prev => prev + 1)
    })

    return unsubscribe
  }, [])

  return {
    t: (key: TranslationKey, params?: Record<string, string | number>) => i18n.t(key, params),
    locale: i18n.getLocale(),
    setLocale: (locale: Locale) => i18n.setLocale(locale),
    isLoading,
  }
}

// Export for non-React usage
export const t = (key: TranslationKey, params?: Record<string, string | number>) =>
  i18n.t(key, params)

export const setLocale = (locale: Locale) => i18n.setLocale(locale)
export const getLocale = () => i18n.getLocale()

