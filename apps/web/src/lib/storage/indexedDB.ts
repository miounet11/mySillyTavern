/**
 * IndexedDB 封装
 * 用于本地存储聊天记录和消息
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb'

// 数据库版本
const DB_VERSION = 1
const DB_NAME = 'sillytavern_chats'

// 定义数据库结构
interface ChatDB extends DBSchema {
  chats: {
    key: string // chatId
    value: {
      id: string
      userId: string
      characterId: string
      title: string
      settings?: string
      isFavorite: boolean
      isArchived: boolean
      createdAt: string
      updatedAt: string
    }
    indexes: {
      'by-userId': string
      'by-characterId': string
      'by-updatedAt': string
    }
  }
  messages: {
    key: string // messageId
    value: {
      id: string
      chatId: string
      userId: string
      role: string
      content: string
      metadata?: string
      timestamp: string
      branchId?: string
    }
    indexes: {
      'by-chatId': string
      'by-userId': string
      'by-timestamp': string
    }
  }
}

let dbInstance: IDBPDatabase<ChatDB> | null = null

/**
 * 初始化数据库
 */
async function initDB(): Promise<IDBPDatabase<ChatDB>> {
  if (dbInstance) {
    return dbInstance
  }

  dbInstance = await openDB<ChatDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 创建 chats 对象存储
      if (!db.objectStoreNames.contains('chats')) {
        const chatStore = db.createObjectStore('chats', { keyPath: 'id' })
        chatStore.createIndex('by-userId', 'userId')
        chatStore.createIndex('by-characterId', 'characterId')
        chatStore.createIndex('by-updatedAt', 'updatedAt')
      }

      // 创建 messages 对象存储
      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' })
        messageStore.createIndex('by-chatId', 'chatId')
        messageStore.createIndex('by-userId', 'userId')
        messageStore.createIndex('by-timestamp', 'timestamp')
      }
    },
  })

  return dbInstance
}

/**
 * 获取数据库实例
 */
async function getDB(): Promise<IDBPDatabase<ChatDB>> {
  return dbInstance || (await initDB())
}

// ==================== Chat 操作 ====================

/**
 * 创建或更新聊天
 */
export async function saveChat(chat: ChatDB['chats']['value']): Promise<void> {
  const db = await getDB()
  await db.put('chats', chat)
}

/**
 * 获取单个聊天
 */
export async function getChat(chatId: string): Promise<ChatDB['chats']['value'] | undefined> {
  const db = await getDB()
  return await db.get('chats', chatId)
}

/**
 * 获取用户的所有聊天
 */
export async function getChatsByUserId(userId: string): Promise<ChatDB['chats']['value'][]> {
  const db = await getDB()
  return await db.getAllFromIndex('chats', 'by-userId', userId)
}

/**
 * 获取角色的所有聊天
 */
export async function getChatsByCharacterId(characterId: string): Promise<ChatDB['chats']['value'][]> {
  const db = await getDB()
  return await db.getAllFromIndex('chats', 'by-characterId', characterId)
}

/**
 * 删除聊天
 */
export async function deleteChat(chatId: string): Promise<void> {
  const db = await getDB()
  
  // 删除聊天相关的所有消息
  const messages = await getMessagesByChatId(chatId)
  const tx = db.transaction(['chats', 'messages'], 'readwrite')
  
  await tx.objectStore('chats').delete(chatId)
  
  for (const message of messages) {
    await tx.objectStore('messages').delete(message.id)
  }
  
  await tx.done
}

/**
 * 更新聊天
 */
export async function updateChat(chatId: string, updates: Partial<ChatDB['chats']['value']>): Promise<void> {
  const db = await getDB()
  const chat = await getChat(chatId)
  
  if (!chat) {
    throw new Error(`Chat ${chatId} not found`)
  }
  
  const updatedChat = {
    ...chat,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  await db.put('chats', updatedChat)
}

// ==================== Message 操作 ====================

/**
 * 保存消息
 */
export async function saveMessage(message: ChatDB['messages']['value']): Promise<void> {
  const db = await getDB()
  await db.put('messages', message)
}

/**
 * 获取单个消息
 */
export async function getMessage(messageId: string): Promise<ChatDB['messages']['value'] | undefined> {
  const db = await getDB()
  return await db.get('messages', messageId)
}

/**
 * 获取聊天的所有消息
 */
export async function getMessagesByChatId(chatId: string): Promise<ChatDB['messages']['value'][]> {
  const db = await getDB()
  const messages = await db.getAllFromIndex('messages', 'by-chatId', chatId)
  
  // 按时间排序
  return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

/**
 * 删除消息
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const db = await getDB()
  await db.delete('messages', messageId)
}

/**
 * 批量保存消息
 */
export async function saveMessages(messages: ChatDB['messages']['value'][]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('messages', 'readwrite')
  
  for (const message of messages) {
    await tx.store.put(message)
  }
  
  await tx.done
}

/**
 * 删除聊天的所有消息
 */
export async function deleteMessagesByChatId(chatId: string): Promise<void> {
  const db = await getDB()
  const messages = await getMessagesByChatId(chatId)
  const tx = db.transaction('messages', 'readwrite')
  
  for (const message of messages) {
    await tx.store.delete(message.id)
  }
  
  await tx.done
}

// ==================== 数据导入/导出 ====================

/**
 * 导出用户的所有聊天数据
 */
export async function exportUserData(userId: string): Promise<{
  chats: ChatDB['chats']['value'][]
  messages: ChatDB['messages']['value'][]
}> {
  const db = await getDB()
  const chats = await getChatsByUserId(userId)
  const messages: ChatDB['messages']['value'][] = []
  
  for (const chat of chats) {
    const chatMessages = await getMessagesByChatId(chat.id)
    messages.push(...chatMessages)
  }
  
  return { chats, messages }
}

/**
 * 导入聊天数据
 */
export async function importUserData(data: {
  chats: ChatDB['chats']['value'][]
  messages: ChatDB['messages']['value'][]
}): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['chats', 'messages'], 'readwrite')
  
  // 导入聊天
  for (const chat of data.chats) {
    await tx.objectStore('chats').put(chat)
  }
  
  // 导入消息
  for (const message of data.messages) {
    await tx.objectStore('messages').put(message)
  }
  
  await tx.done
}

/**
 * 清空用户的所有数据
 */
export async function clearUserData(userId: string): Promise<void> {
  const db = await getDB()
  const chats = await getChatsByUserId(userId)
  
  const tx = db.transaction(['chats', 'messages'], 'readwrite')
  
  // 删除所有聊天
  for (const chat of chats) {
    await tx.objectStore('chats').delete(chat.id)
  }
  
  // 删除所有消息
  const allMessages = await db.getAllFromIndex('messages', 'by-userId', userId)
  for (const message of allMessages) {
    await tx.objectStore('messages').delete(message.id)
  }
  
  await tx.done
}

/**
 * 获取数据库统计信息
 */
export async function getDBStats(userId: string): Promise<{
  totalChats: number
  totalMessages: number
  storageUsed: string
}> {
  const chats = await getChatsByUserId(userId)
  let totalMessages = 0
  
  for (const chat of chats) {
    const messages = await getMessagesByChatId(chat.id)
    totalMessages += messages.length
  }
  
  // 估算存储使用
  const data = await exportUserData(userId)
  const dataStr = JSON.stringify(data)
  const bytes = new Blob([dataStr]).size
  const mb = (bytes / (1024 * 1024)).toFixed(2)
  
  return {
    totalChats: chats.length,
    totalMessages,
    storageUsed: `${mb} MB`,
  }
}

