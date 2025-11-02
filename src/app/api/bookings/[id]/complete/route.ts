import connectDB from '@/lib/db'
import Booking from '@/lib/models/booking'
import Lawyer from '@/lib/models/lawyer'
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

// POST - Mark booking as completed (Lawyer only)
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ updated type
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createErrorResponse('Unauthorized', 401)
    }

    await connectDB()

    const { id } = await context.params // ✅ await params

    const lawyer = await Lawyer.findOne({ clerkId: userId })
    if (!lawyer) {
      return createErrorResponse('Only lawyers can complete bookings', 403)
    }

    const booking = await Booking.findById(id)
    if (!booking) {
      return createErrorResponse('Booking not found', 404)
    }

    if (booking.lawyerId.toString() !== lawyer._id.toString()) {
      return createErrorResponse('Forbidden', 403)
    }

    if (booking.status !== 'approved') {
      return createErrorResponse('Only approved bookings can be completed', 400)
    }

    const body = await req.json()
    const { sessionNotes } = body

    booking.status = 'completed'
    booking.completedAt = new Date()

    if (sessionNotes) {
      booking.lawyerNotes = sessionNotes
    }

    // (Optional: adjust if you integrate actual payment logic)
    booking.paymentStatus = 'paid'

    await booking.save()

    lawyer.totalCasesSolved += 1
    await lawyer.save()

    await booking.populate([
      { path: 'clientId', select: 'firstName lastName email' },
      {
        path: 'lawyerId',
        populate: { path: 'userId', select: 'firstName lastName email' },
      },
    ])

    return createSuccessResponse(booking, 'Session completed successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
