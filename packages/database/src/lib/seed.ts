/**
 * Database seed data
 */

import { prisma } from './client'
import { nanoid } from 'nanoid'
import { seedCharacters } from './seed-characters'

const defaultCharacters = [
  {
    name: 'Assistant',
    description: 'A helpful AI assistant',
    personality: 'Helpful, friendly, and knowledgeable',
    firstMessage: 'Hello! How can I help you today?',
    background: 'An AI assistant designed to help with various tasks and questions.',
    exampleMessages: JSON.stringify([
      "I can help you with a wide range of topics. What would you like to know?",
      "Feel free to ask me anything! I'm here to assist you.",
      "What's on your mind today? I'm ready to help!"
    ]),
    tags: JSON.stringify(['assistant', 'helpful', 'ai']),
    settings: JSON.stringify({
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    })
  },
  {
    name: 'Storyteller',
    description: 'A creative storyteller for interactive fiction',
    personality: 'Imaginative, descriptive, and engaging',
    firstMessage: 'Welcome to our story! Where shall our adventure begin?',
    background: 'An experienced storyteller who loves creating immersive narratives and interactive adventures.',
    exampleMessages: JSON.stringify([
      "The moon cast long shadows across the ancient forest as you stood at the crossroads...",
      "You find yourself in a bustling marketplace, the air thick with spices and the sound of merchants calling their wares...",
      "The old wizard looks up from his ancient tome, his eyes twinkling with mysterious knowledge..."
    ]),
    tags: JSON.stringify(['storyteller', 'creative', 'fiction', 'roleplay']),
    settings: JSON.stringify({
      temperature: 0.8,
      maxTokens: 1500,
      topP: 0.9,
      frequencyPenalty: 0.1,
      presencePenalty: 0.2
    })
  },
  {
    name: 'Teacher',
    description: 'A patient and knowledgeable teacher',
    personality: 'Patient, encouraging, and knowledgeable',
    firstMessage: 'Hello! I\'m here to help you learn. What subject would you like to explore today?',
    background: 'An experienced teacher passionate about making learning engaging and accessible for everyone.',
    exampleMessages: JSON.stringify([
      "That\'s an excellent question! Let me break this down into simple steps for you.",
      "Great progress! You\'re really understanding this concept well.",
      "Don\'t worry if this seems challenging at first - we\'ll work through it together."
    ]),
    tags: JSON.stringify(['teacher', 'education', 'learning', 'helpful']),
    settings: JSON.stringify({
      temperature: 0.5,
      maxTokens: 2000,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    })
  }
]

const defaultWorldInfo = [
  {
    name: 'Basic Greeting Information',
    content: 'This is a basic conversation between a user and an AI assistant. The conversation should be friendly and helpful.',
    keywords: JSON.stringify(['conversation', 'chat', 'basic', 'greeting']),
    activationType: 'keyword' as const,
    priority: 1,
    enabled: true,
    settings: JSON.stringify({
      caseSensitive: false,
      wholeWordsOnly: false,
      useRegex: false
    })
  },
  {
    name: 'AI Assistant Guidelines',
    content: 'As an AI assistant, I should be helpful, honest, and harmless. I should admit when I don\'t know something and avoid making up information.',
    keywords: JSON.stringify(['guidelines', 'assistant', 'ai', 'helpful']),
    activationType: 'keyword' as const,
    priority: 2,
    enabled: true,
    settings: JSON.stringify({
      caseSensitive: false,
      wholeWordsOnly: false,
      useRegex: false
    })
  },
  {
    name: 'General Context',
    content: 'This is a general-purpose conversation platform where users can interact with various AI characters for entertainment, learning, and assistance.',
    keywords: JSON.stringify(['context', 'general', 'platform', 'purpose']),
    activationType: 'always' as const,
    priority: 0,
    enabled: true,
    settings: JSON.stringify({})
  }
]

const defaultAIModels = [
  {
    name: 'OpenAI GPT-3.5 Turbo',
    provider: 'openai' as const,
    model: 'gpt-3.5-turbo',
    settings: JSON.stringify({
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    }),
    isActive: true
  },
  {
    name: 'OpenAI GPT-4',
    provider: 'openai' as const,
    model: 'gpt-4',
    settings: JSON.stringify({
      temperature: 0.7,
      maxTokens: 1500,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    }),
    isActive: false
  },
  {
    name: 'Anthropic Claude',
    provider: 'anthropic' as const,
    model: 'claude-3-sonnet-20240229',
    settings: JSON.stringify({
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    }),
    isActive: false
  },
  {
    name: 'Local Model',
    provider: 'local' as const,
    model: 'local-llm',
    settings: JSON.stringify({
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    }),
    isActive: false
  }
]

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // Check if data already exists
    const existingCharacters = await prisma.character.count()
    const existingWorldInfo = await prisma.worldInfo.count()
    const existingModels = await prisma.aIModelConfig.count()

    if (existingCharacters > 0 || existingWorldInfo > 0 || existingModels > 0) {
      console.log('📊 Database already contains data. Skipping seeding.')
      console.log('💡 To re-seed with new characters, run: npx prisma db seed --force')
      return
    }

    // Characters are no longer seeded automatically
    // Users start with an empty character list and can:
    // 1. Create their own characters
    // 2. Download from community
    // 3. Import from files (.json/.png)
    // console.log('📝 Creating high-quality character cards...')
    // await seedCharacters()

    // Seed default world info
    console.log('🌍 Creating default world info entries...')
    for (const worldInfo of defaultWorldInfo) {
      const created = await prisma.worldInfo.create({
        data: {
          id: nanoid(),
          ...worldInfo
        }
      })

      // Link world info to all characters (global entries)
      if (worldInfo.activationType === 'always') {
        const characters = await prisma.character.findMany()
        for (const character of characters) {
          await prisma.worldInfoCharacter.create({
            data: {
              worldInfoId: created.id,
              characterId: character.id
            }
          })
        }
      }
    }

    // Seed default AI models
    console.log('🤖 Creating default AI model configurations...')
    for (const model of defaultAIModels) {
      await prisma.aIModelConfig.create({
        data: {
          id: nanoid(),
          ...model
        }
      })
    }

    // Create default user settings
    console.log('⚙️ Creating default user settings...')
    await prisma.userSetting.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        theme: 'dark',
        language: 'en',
        uiSettings: JSON.stringify({
          fontSize: 'medium',
          sidebarWidth: 320,
          compactMode: false,
          showTimestamps: true,
          showAvatars: true,
          messageLayout: 'bubble'
        })
      }
    })

    console.log('✅ Database seeding completed successfully!')
    console.log(`Created ${defaultWorldInfo.length} world info entries`)
    console.log(`Created ${defaultAIModels.length} AI model configurations`)
    console.log('💡 Character list starts empty - users can create or import their own')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

export async function resetDatabase() {
  console.log('🔄 Resetting database...')

  try {
    // Delete all data in reverse order of dependencies
    await prisma.systemLog.deleteMany()
    await prisma.fileStorage.deleteMany()
    await prisma.pluginSetting.deleteMany()
    await prisma.plugin.deleteMany()
    await prisma.worldInfoVector.deleteMany()
    await prisma.worldInfoCharacter.deleteMany()
    await prisma.worldInfo.deleteMany()
    await prisma.aIModelConfig.deleteMany()
    await prisma.message.deleteMany()
    await prisma.chatBranch.deleteMany()
    await prisma.chat.deleteMany()
    await prisma.character.deleteMany()
    await prisma.userSetting.deleteMany()

    console.log('✅ Database reset completed!')

    // Re-seed with default data
    await seedDatabase()

  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  }
}

// Function to check if database needs seeding
export async function needsSeeding(): Promise<boolean> {
  try {
    const characterCount = await prisma.character.count()
    return characterCount === 0
  } catch (error) {
    console.error('Error checking if database needs seeding:', error)
    return true
  }
}