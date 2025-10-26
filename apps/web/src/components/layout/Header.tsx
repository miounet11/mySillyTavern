"use client"

import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  
  const getPageTitle = () => {
    if (pathname?.includes('/chat')) return '聊天'
    if (pathname?.includes('/world-info')) return '世界信息'
    return 'SillyTavern'
  }

  return (
    <header className="h-16 border-b border-gray-800 bg-gray-900 flex items-center px-6">
      <h1 className="text-xl font-semibold text-gray-100">
        {getPageTitle()}
      </h1>
    </header>
  )
}

