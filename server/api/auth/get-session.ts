import { auth } from '~/lib/auth'

export default defineEventHandler(async (event) => {
  try {
    // Get the session from the request
    const request = toWebRequest(event)
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return {
        user: null,
        session: null,
      }
    }

    return {
      user: session.user,
      session: session,
    }
  } catch (error) {
    console.error('Get session error:', error)
    return {
      user: null,
      session: null,
    }
  }
})
