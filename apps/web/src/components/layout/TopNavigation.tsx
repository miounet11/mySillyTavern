"use client"

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { MessageSquare, Users, Globe, Settings, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TopNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: '首页', href: '/', icon: MessageSquare },
    { name: '角色卡', href: '/characters', icon: Users },
    { name: '角色卡社区', href: '/characters/community', icon: Globe },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  const handleSettingsClick = () => {
    window.dispatchEvent(new CustomEvent('open-settings'))
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-gray-900/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 transition-all"
            >
              <MessageSquare className="w-6 h-6 text-teal-400" />
              <span>SillyTavern</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-gray-800 text-teal-400'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </button>
              )
            })}

            <button
              onClick={handleSettingsClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-all"
            >
              <Settings className="w-4 h-4" />
              设置
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-gray-800 text-teal-400'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </button>
              )
            })}

            <button
              onClick={() => {
                handleSettingsClick()
                setIsMobileMenuOpen(false)
              }}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-all"
            >
              <Settings className="w-5 h-5" />
              设置
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

