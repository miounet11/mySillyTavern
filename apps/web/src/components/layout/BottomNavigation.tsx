"use client"

import { useRouter, usePathname } from 'next/navigation'
import { IconHome, IconUsers, IconWorld, IconUser } from '@tabler/icons-react'
import { useSettingsUIStore } from '@/stores/settingsUIStore'

export default function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { toggleSettings } = useSettingsUIStore()

  const navigation = [
    { name: '首页', href: '/', icon: IconHome, onClick: null },
    { name: '角色卡', href: '/characters', icon: IconUsers, onClick: null },
    { name: '角色卡社区', href: '/characters/community', icon: IconWorld, onClick: null },
    { name: '定义User名称', href: null, icon: IconUser, onClick: () => toggleSettings('general') },
  ]

  const isActive = (href: string | null) => {
    if (!href) return false
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 bottom-nav-safe">
      <div className="grid grid-cols-4 h-16">
        {navigation.map((item, index) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <button
              key={item.href || `action-${index}`}
              onClick={() => {
                if (item.onClick) {
                  item.onClick()
                } else if (item.href) {
                  router.push(item.href)
                }
              }}
              className={`
                flex flex-col items-center justify-center gap-1 
                transition-colors duration-200
                active:bg-gray-800/50
                ${active 
                  ? 'text-teal-400' 
                  : 'text-gray-400 hover:text-gray-200'
                }
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium leading-tight">
                {item.name}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

