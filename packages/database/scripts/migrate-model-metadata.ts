/**
 * Data Migration Script: Add default metadata to existing AI models
 * 
 * This script updates existing models in the database to add default
 * capabilities and metadata based on their provider and model name.
 * 
 * Usage: pnpm tsx scripts/migrate-model-metadata.ts
 */

import { PrismaClient } from '@prisma/client'
import { findModelPreset } from '@sillytavern-clone/shared'

const prisma = new PrismaClient()

async function migrateModelMetadata() {
  console.log('🔄 Starting model metadata migration...\n')

  try {
    // Fetch all models
    const models = await prisma.aIModelConfig.findMany()
    console.log(`📊 Found ${models.length} models to migrate\n`)

    let updatedCount = 0
    let skippedCount = 0

    for (const model of models) {
      // Skip if already has metadata
      if (model.metadata) {
        console.log(`⏭️  Skipping ${model.name} - already has metadata`)
        skippedCount++
        continue
      }

      // Try to find preset for this model
      const preset = findModelPreset(model.provider, model.model)

      if (preset) {
        // Update with preset data
        await prisma.aIModelConfig.update({
          where: { id: model.id },
          data: {
            capabilities: JSON.stringify(preset.capabilities),
            metadata: JSON.stringify(preset.metadata),
          },
        })

        console.log(`✅ Updated ${model.name} (${model.provider}/${model.model})`)
        console.log(`   - Input: ${preset.metadata.inputWindow}, Output: ${preset.metadata.outputWindow}`)
        console.log(`   - Capabilities: Vision=${preset.capabilities.vision}, Tools=${preset.capabilities.tools}\n`)
        updatedCount++
      } else {
        // Add default metadata for unknown models
        const defaultCapabilities = {
          streaming: true,
          images: false,
          tools: false,
          vision: false,
          audio: false,
        }

        const defaultMetadata = {
          inputWindow: 4096,
          outputWindow: 4096,
          displayName: model.name,
          description: `${model.provider} model`,
          isReasoning: false,
        }

        await prisma.aIModelConfig.update({
          where: { id: model.id },
          data: {
            capabilities: JSON.stringify(defaultCapabilities),
            metadata: JSON.stringify(defaultMetadata),
          },
        })

        console.log(`⚠️  Updated ${model.name} with default metadata (no preset found)`)
        console.log(`   - Using default: 4K input/output\n`)
        updatedCount++
      }
    }

    console.log('\n✨ Migration completed!')
    console.log(`   - Updated: ${updatedCount}`)
    console.log(`   - Skipped: ${skippedCount}`)
    console.log(`   - Total: ${models.length}\n`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateModelMetadata()
  .then(() => {
    console.log('🎉 Migration script finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error)
    process.exit(1)
  })

