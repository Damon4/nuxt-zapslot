import { auth } from '~/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Only allow PATCH method for profile updates
  if (event.method !== 'PATCH') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
    })
  }

  try {
    // Get the session from the request using better-auth
    const request = toWebRequest(event)
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }

    // Get the request body
    const body = await readBody(event)

    // Validate the input
    if (!body.name || typeof body.name !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is required and must be a string',
      })
    }

    if (!body.email || typeof body.email !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required and must be a string',
      })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format',
      })
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: body.email,
        id: { not: session.user.id },
      },
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Email is already taken',
      })
    }

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return {
      success: true,
      user: updatedUser,
    }
  } catch (error) {
    // Re-throw createError instances
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Log unexpected errors
    console.error('Profile update error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
