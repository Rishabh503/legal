import connectDB from '@/lib/db'
import Booking from '@/lib/models/booking'
import Lawyer from '@/lib/models/lawyer'
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createErrorResponse('Unauthorized', 401)
    }

    await connectDB()

    const { id } = await context.params // 👈 await the params now
    const lawyer = await Lawyer.findOne({ clerkId: userId })

    if (!lawyer) {
      return createErrorResponse('Only lawyers can approve bookings', 403)
    }

    const booking = await Booking.findById(id)
    if (!booking) {
      return createErrorResponse('Booking not found', 404)
    }

    if (booking.lawyerId.toString() !== lawyer._id.toString()) {
      return createErrorResponse('Forbidden', 403)
    }

    if (booking.status !== 'pending') {
      return createErrorResponse('Only pending bookings can be approved', 400)
    }

    const body = await req.json()
    const { confirmedDateTime, meetingLink, lawyerNotes } = body

    booking.status = 'approved'
    booking.approvedAt = new Date()
    booking.confirmedDateTime = new Date(confirmedDateTime)

    if (meetingLink) booking.meetingLink = meetingLink
    if (lawyerNotes) booking.lawyerNotes = lawyerNotes

    await booking.save()

    await booking.populate([
      { path: 'clientId', select: 'firstName lastName email' },
      { path: 'lawyerId', populate: { path: 'userId', select: 'firstName lastName email' } },
    ])

    return createSuccessResponse(booking, 'Booking approved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
