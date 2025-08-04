import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readdirSync } from 'fs'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const prisma = new PrismaClient()

interface MigrationRecord {
  name: string
  executedAt: Date
}

async function createMigrationTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS _data_migrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMP(3) NOT NULL
      )
    `
    console.log('📋 Migration tracking table ready')
  } catch (error) {
    console.error('❌ Failed to create migration table:', error)
    throw error
  }
}

async function getExecutedMigrations(): Promise<string[]> {
  try {
    const result = await prisma.$queryRaw<MigrationRecord[]>`
      SELECT name FROM _data_migrations ORDER BY executed_at
    `
    return result.map((r) => r.name)
  } catch {
    console.warn('⚠️ Could not fetch migration history, assuming fresh start')
    return []
  }
}

async function recordMigration(name: string) {
  // Generate a unique ID for the migration record
  const id = `migration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  await prisma.$executeRaw`
    INSERT INTO _data_migrations (id, name, executed_at) VALUES (${id}, ${name}, NOW())
  `
}

async function runDataMigrations() {
  console.log('🔄 Starting data migration runner...')

  try {
    // Ensure migration table exists
    await createMigrationTable()

    // Get list of executed migrations
    const executedMigrations = await getExecutedMigrations()
    console.log(
      `📊 Found ${executedMigrations.length} previously executed migrations`
    )

    // Get list of migration files
    const migrationsDir = join(__dirname, 'migrations')
    const migrationFiles = readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
      .filter((file) => !file.startsWith('index'))
      .sort()

    console.log(`📁 Found ${migrationFiles.length} migration files`)

    // Run pending migrations
    let executed = 0
    for (const file of migrationFiles) {
      const migrationName = file.replace(/\.(ts|js)$/, '')

      if (executedMigrations.includes(migrationName)) {
        console.log(`⏭️ Skipping ${migrationName} (already executed)`)
        continue
      }

      console.log(`🚀 Running migration: ${migrationName}`)

      try {
        // Dynamic import of migration
        const migrationPath = join(migrationsDir, file)
        const migration = await import(migrationPath)

        // Run migration (look for default export or run function)
        if (typeof migration.default === 'function') {
          await migration.default()
        } else if (typeof migration.run === 'function') {
          await migration.run()
        } else {
          console.warn(
            `⚠️ Migration ${migrationName} has no default export or run function`
          )
          continue
        }

        // Record successful execution
        await recordMigration(migrationName)
        executed++
        console.log(`✅ Migration ${migrationName} completed`)
      } catch (error) {
        console.error(`❌ Migration ${migrationName} failed:`, error)
        throw error
      }
    }

    if (executed === 0) {
      console.log('✨ No new migrations to run - database is up to date!')
    } else {
      console.log(`✨ Successfully executed ${executed} migrations!`)
    }
  } catch (error) {
    console.error('❌ Migration runner failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDataMigrations().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}

export { runDataMigrations }
