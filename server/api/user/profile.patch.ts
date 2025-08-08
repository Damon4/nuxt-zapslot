import { auth } from '~/lib/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  // Only allow PATCH method for profile updates
  if (event.method !== 'PATCH') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
    })
  }

  try {
    // Required order: readBody() → auth check (Nuxt 4)
    const body: { name?: string } = await readBody(event)

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

    // Validate the input
    if (!body.name || typeof body.name !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is required and must be a string',
      })
    }

    if (body.name.trim().length < 2) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name must be at least 2 characters long',
      })
    }

    if (body.name.trim().length > 100) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name must be less than 100 characters',
      })
    }

    // Update user data in database using Prisma
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: body.name.trim(),
        updatedAt: new Date(),
      },
    })

    // Update the session with new user data
    try {
      // Update session using better-auth
      await auth.api.updateUser({
        headers: request.headers,
        body: {
          name: updatedUser.name,
        },
      })
    } catch (sessionError) {
      console.warn(
        'Failed to update session, but user data was updated:',
        sessionError
      )
      // Continue anyway - the data was updated, session will sync on next request
    }

    return {
      success: true,
    }
  } catch (error) {
    // Re-throw createError instances
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  } finally {
    // Close Prisma connection
    await prisma.$disconnect()
  }
})
