"use client"

import { useChatStore } from '@/stores/chatStore'

export default function ChatList() {
  const { chats, currentChat, setCurrentChat } = useChatStore()

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-gray-100">对话列表</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            暂无对话
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setCurrentChat(chat)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentChat?.id === chat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="font-medium truncate">{chat.title || '新对话'}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(chat.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

