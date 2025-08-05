#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

// Find all API files with new PrismaClient()
const findFilesWithPrismaClient = () => {
  try {
    const output = execSync(
      'find server/api -name "*.ts" -exec grep -l "new PrismaClient()" {} \\;',
      { encoding: 'utf-8', cwd: process.cwd() }
    )
    return output.trim().split('\n').filter(Boolean)
  } catch (error) {
    console.error('Error finding files:', error)
    return []
  }
}

// Fix a single file
const fixFile = (filePath: string) => {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    let content = fs.readFileSync(fullPath, 'utf-8')

    // Replace PrismaClient import patterns
    const patterns = [
      // Pattern 1: import { PrismaClient } from '@prisma/client'
      {
        from: /import\s*{\s*PrismaClient\s*}\s*from\s*'@prisma\/client'/g,
        to: '',
      },
      // Pattern 2: import { PrismaClient, type Something } from '@prisma/client'
      {
        from: /import\s*{\s*PrismaClient,\s*(.*?)\s*}\s*from\s*'@prisma\/client'/g,
        to: "import { $1 } from '@prisma/client'",
      },
      // Pattern 3: import { type Something, PrismaClient } from '@prisma/client'
      {
        from: /import\s*{\s*(.*?),\s*PrismaClient\s*}\s*from\s*'@prisma\/client'/g,
        to: "import { $1 } from '@prisma/client'",
      },
      // Pattern 4: const prisma = new PrismaClient()
      {
        from: /const\s+prisma\s*=\s*new\s+PrismaClient\(\)/g,
        to: '',
      },
    ]

    // Apply replacements
    patterns.forEach(({ from, to }) => {
      content = content.replace(from, to)
    })

    // Clean up extra empty lines
    content = content.replace(/\n\n\n+/g, '\n\n')

    // Add prisma import if not already present
    if (!content.includes("from '~/lib/prisma'")) {
      // Find the best place to insert the import
      const lines = content.split('\n')
      let insertIndex = 0

      // Find last import statement
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          insertIndex = i + 1
        } else if (lines[i].trim() === '' && insertIndex > 0) {
          break
        }
      }

      lines.splice(insertIndex, 0, "import { prisma } from '~/lib/prisma'")
      content = lines.join('\n')
    }

    // Write back the fixed content
    fs.writeFileSync(fullPath, content, 'utf-8')
    console.log(`✅ Fixed: ${filePath}`)
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error)
  }
}

// Main execution
const main = () => {
  console.log('🔍 Finding files with PrismaClient instances...')
  const files = findFilesWithPrismaClient()

  if (files.length === 0) {
    console.log('✅ No files found with new PrismaClient() instances')
    return
  }

  console.log(`📝 Found ${files.length} files to fix:`)
  files.forEach((file) => console.log(`   - ${file}`))

  console.log('\n🔧 Fixing files...')
  files.forEach(fixFile)

  console.log('\n✅ All files have been processed!')
  console.log('\n📋 Summary:')
  console.log('   - Replaced new PrismaClient() with import from ~/lib/prisma')
  console.log(
    '   - All files now use the centralized Prisma client with logging'
  )
  console.log('   - This enables SQL query logging across all API endpoints')
}

main()
