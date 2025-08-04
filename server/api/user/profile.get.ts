import { auth } from '~/lib/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
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

    // Fetch the user profile data
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
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

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    // Re-throw createError instances
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Log unexpected errors
    console.error('Profile fetch error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
