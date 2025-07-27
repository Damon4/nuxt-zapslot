import { auth } from '~/lib/auth'
import type { H3Event } from 'h3'

/**
 * Server-side utility to get authenticated user session
 * @param event H3Event from the request
 * @returns User session or throws authentication error
 */
export async function requireAuth(event: H3Event) {
  try {
    const request = toWebRequest(event)
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })
    }

    return session
  } catch (error) {
    // Re-throw createError instances
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Wrap other errors
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication failed',
    })
  }
}

/**
 * Server-side utility to get user session (optional)
 * @param event H3Event from the request
 * @returns User session or null if not authenticated
 */
export async function getAuth(event: H3Event) {
  try {
    const request = toWebRequest(event)
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    return session
  } catch (error) {
    console.error('Failed to get auth session:', error)
    return null
  }
}

/**
 * Server-side utility to require admin authentication
 * @param event H3Event from the request
 * @returns Admin user session or throws authorization error
 */
export async function requireAdmin(event: H3Event) {
  const session = await requireAuth(event)

  // Type assertion since Better Auth types don't include isAdmin yet
  const user = session.user as typeof session.user & { isAdmin?: boolean }

  if (!user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

  return session
}
