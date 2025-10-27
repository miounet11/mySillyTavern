/**
 * Seed script entry point
 */

import { seedDatabase } from './lib/seed'
import { prisma } from './lib/client'

async function main() {
  try {
    await seedDatabase()
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

