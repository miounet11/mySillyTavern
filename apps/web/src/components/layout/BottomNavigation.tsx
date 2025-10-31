"use client"

import { useRouter, usePathname } from 'next/navigation'
import { IconHome, IconUsers, IconWorld, IconUser } from '@tabler/icons-react'

export default function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { name: '首页', href: '/', icon: IconHome },
    { name: '角色卡', href: '/characters', icon: IconUsers },
    { name: '角色卡社区', href: '/characters/community', icon: IconWorld },
    { name: '定义User名称', href: '/user-profile', icon: IconUser },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 bottom-nav-safe">
      <div className="grid grid-cols-4 h-16">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
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

