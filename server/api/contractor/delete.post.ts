import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)
    const user = session.user

    // Find existing contractor
    const existingContractor = await prisma.contractor.findUnique({
      where: { userId: user.id },
      include: {
        services: true,
      },
    })

    if (!existingContractor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Contractor profile not found',
      })
    }

    if (existingContractor.status !== 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Contractor is not active',
      })
    }

    // Start transaction to delete contractor and all services
    const result = await prisma.$transaction(async (tx) => {
      // First, delete all contractor's services
      const deletedServices = await tx.service.deleteMany({
        where: { contractorId: existingContractor.id },
      })

      // Then, delete contractor profile
      await tx.contractor.delete({
        where: { id: existingContractor.id },
      })

      return {
        deletedServicesCount: deletedServices.count,
        contractorId: existingContractor.id,
      }
    })

    return {
      success: true,
      message: 'Contractor profile and all services deleted successfully',
      deletedServices: result.deletedServicesCount,
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Error deleting contractor:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
