/**
 * Chat list page
 */

import { Suspense } from 'react'
import ChatList from '@/components/chat/ChatList'
import ChatInterface from '@/components/chat/ChatInterface'
import { Loader2 } from 'lucide-react'

export default function ChatPage() {
  return (
    <div className="flex h-full">
      {/* Sidebar with chat list */}
      <div className="w-80 border-r border-gray-800 flex flex-col">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
          <ChatList />
        </Suspense>
      </div>

      {/* Main chat interface */}
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
          <ChatInterface />
        </Suspense>
      </div>
    </div>
  )
}