import { auth } from '~/lib/auth'

export default defineEventHandler(async (event) => {
  // Only allow PATCH method for profile updates
  if (event.method !== 'PATCH') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
    })
  }

  try {
    // Read request body FIRST - before better-auth processing
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

    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: session.user.id,
        name: body.name.trim(),
        email: session.user.email, // Email остается из сессии, не изменяется
        emailVerified: session.user.emailVerified,
        image: session.user.image,
        createdAt: session.user.createdAt,
        updatedAt: new Date().toISOString(),
      },
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
  }
})
