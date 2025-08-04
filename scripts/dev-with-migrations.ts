#!/usr/bin/env node
import { exec } from 'child_process'
import { promisify } from 'util'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const execAsync = promisify(exec)

async function runCommand(
  command: string,
  description: string,
  ignoreErrors = false
) {
  console.log(`🔄 ${description}...`)
  try {
    const { stdout, stderr } = await execAsync(command)
    if (stdout) console.log(stdout)
    if (stderr && !ignoreErrors) console.warn(stderr)
    console.log(`✅ ${description} completed`)
    return true
  } catch (error) {
    if (ignoreErrors) {
      console.warn(`⚠️ ${description} failed (continuing):`, error)
      return false
    } else {
      console.error(`❌ ${description} failed:`, error)
      throw error
    }
  }
}

async function devWithMigrations() {
  console.log('🚀 Starting development with migrations...')

  try {
    // 1. Try to run Prisma migrations (might fail in dev if no new migrations)
    await runCommand(
      'npx prisma migrate dev --name auto_dev_migration',
      'Applying development migrations',
      true // ignore errors for auto migrations
    )

    // 2. Generate Prisma client
    await runCommand('npx prisma generate', 'Generating Prisma client')

    // 3. Run data migrations
    await runCommand(
      'npx tsx scripts/run-migrations.ts',
      'Running data migrations'
    )

    console.log('✨ Migration setup completed! Starting development server...')

    // 4. Start development server
    await runCommand('nuxt dev', 'Starting Nuxt development server')
  } catch (error) {
    console.error('❌ Development setup failed:', error)
    process.exit(1)
  }
}

// Run dev setup
devWithMigrations()
