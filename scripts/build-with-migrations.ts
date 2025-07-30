#!/usr/bin/env node
import { exec } from 'child_process'
import { promisify } from 'util'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const execAsync = promisify(exec)

async function runCommand(command: string, description: string) {
  console.log(`🔄 ${description}...`)
  try {
    const { stdout, stderr } = await execAsync(command)
    if (stdout) console.log(stdout)
    if (stderr) console.warn(stderr)
    console.log(`✅ ${description} completed`)
  } catch (error) {
    console.error(`❌ ${description} failed:`, error)
    throw error
  }
}

async function buildWithMigrations() {
  console.log('🚀 Starting build process with migrations...')

  try {
    // 1. Run Prisma migrations
    await runCommand(
      'npx prisma migrate deploy',
      'Applying database schema migrations'
    )

    // 2. Generate Prisma client
    await runCommand('npx prisma generate', 'Generating Prisma client')

    // 3. Run data migrations
    await runCommand(
      'npx tsx scripts/run-migrations.ts',
      'Running data migrations'
    )

    // 4. Build the application
    await runCommand('nuxt build', 'Building Nuxt application')

    console.log('✨ Build process completed successfully!')
  } catch (error) {
    console.error('❌ Build process failed:', error)
    process.exit(1)
  }
}

// Run build
buildWithMigrations()
