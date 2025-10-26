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
    }
  }

  static getInstance(): I18n {
    if (!I18n.instance) {
      I18n.instance = new I18n()
    }
    return I18n.instance
  }

  async loadTranslations(locale: Locale): Promise<void> {
    if (this.translations.has(locale)) {
      return
    }

    try {
      const response = await fetch(`/locales/${locale}/common.json`)
      const translations = await response.json()
      this.translations.set(locale, translations)
    } catch (error) {
      console.error(`Failed to load translations for locale: ${locale}`, error)
    }
  }

  getLocale(): Locale {
    return this.currentLocale
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
  const [, setUpdate] = useState(0)

  useEffect(() => {
    // Load current locale translations
    i18n.loadTranslations(i18n.getLocale())

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
  }
}

// Export for non-React usage
export const t = (key: TranslationKey, params?: Record<string, string | number>) =>
  i18n.t(key, params)

export const setLocale = (locale: Locale) => i18n.setLocale(locale)
export const getLocale = () => i18n.getLocale()

