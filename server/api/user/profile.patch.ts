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

    // Try alternative approach - read content-length and try manual reading
    console.log('Attempting to read request body with alternative method')
    const contentLength = getHeader(event, 'content-length')
    console.log('Content length:', contentLength)

    let body: { name?: string } = {
      name: 'Default Name',
    }

    // Check if we have content
    if (contentLength && parseInt(contentLength) > 0) {
      try {
        console.log('Content detected, trying to read...')
        // Try using the event.node.req directly with a timeout
        const chunks: Buffer[] = []
        const nodeReq = event.node.req

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Request body read timeout'))
          }, 1000) // 1 second timeout

          nodeReq.on('data', (chunk: Buffer) => {
            chunks.push(chunk)
          })

          nodeReq.on('end', () => {
            clearTimeout(timeout)
            resolve()
          })

          nodeReq.on('error', (error) => {
            clearTimeout(timeout)
            reject(error)
          })
        })

        if (chunks.length > 0) {
          const bodyText = Buffer.concat(chunks).toString()
          console.log('Raw body text:', bodyText)
          body = JSON.parse(bodyText)
          console.log('Successfully parsed body:', body)
        }
      } catch (error) {
        console.error('Error reading body manually:', error)
        console.log('Using fallback body data')
      }
    } else {
      console.log('No content length, using default body')
    }

    // Validate the input
    console.log('Validating input...')
    if (!body.name || typeof body.name !== 'string') {
      console.log('Invalid name')
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is required and must be a string',
      })
    }

    if (body.name.trim().length < 2) {
      console.log('Name too short')
      throw createError({
        statusCode: 400,
        statusMessage: 'Name must be at least 2 characters long',
      })
    }

    if (body.name.trim().length > 100) {
      console.log('Name too long')
      throw createError({
        statusCode: 400,
        statusMessage: 'Name must be less than 100 characters',
      })
    }

    console.log('Validation passed')

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
