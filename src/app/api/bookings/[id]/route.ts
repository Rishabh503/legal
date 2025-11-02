import connectDB from '@/lib/db'
import Booking from '@/lib/models/booking'
import Lawyer from '@/lib/models/lawyer'
import User from '@/lib/models/user'
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

// GET single booking
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ updated
) {
  try {
    const { userId } = await auth()
    if (!userId) return createErrorResponse('Unauthorized', 401)

    await connectDB()
    const { id } = await context.params // ✅ await params

    const booking = await Booking.findById(id)
      .populate('clientId', 'firstName lastName email profileImage phone')
      .populate({
        path: 'lawyerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email profileImage phone',
        },
      })
      .lean()

    if (!booking) return createErrorResponse('Booking not found', 404)

    const user = await User.findOne({ clerkId: userId })
    const lawyer = await Lawyer.findOne({ clerkId: userId })

    const hasAccess =
      booking.clientId._id.toString() === user?._id.toString() ||
      booking.lawyerId._id.toString() === lawyer?._id.toString()

    if (!hasAccess) return createErrorResponse('Forbidden', 403)

    return createSuccessResponse(booking)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH - Update booking
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ updated
) {
  try {
    const { userId } = await auth()
    if (!userId) return createErrorResponse('Unauthorized', 401)

    await connectDB()
    const { id } = await context.params // ✅ await params

    const booking = await Booking.findById(id)
    if (!booking) return createErrorResponse('Booking not found', 404)

    const body = await req.json()
    const allowedUpdates = ['clientNotes', 'lawyerNotes', 'meetingLink']
    const updates: Record<string, any> = {}

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) updates[key] = body[key]
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).populate([
      { path: 'clientId', select: 'firstName lastName email' },
      {
        path: 'lawyerId',
        populate: { path: 'userId', select: 'firstName lastName email' },
      },
    ])

    return createSuccessResponse(updatedBooking, 'Booking updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE - Cancel booking
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ updated
) {
  try {
    const { userId } = await auth()
    if (!userId) return createErrorResponse('Unauthorized', 401)

    await connectDB()
    const { id } = await context.params // ✅ await params

    const booking = await Booking.findById(id)
    if (!booking) return createErrorResponse('Booking not found', 404)

    if (['completed', 'cancelled'].includes(booking.status)) {
      return createErrorResponse('Cannot cancel this booking', 400)
    }

    const { cancellationReason } = await req.json()
    booking.status = 'cancelled'
    booking.cancelledAt = new Date()
    booking.cancellationReason = cancellationReason || 'No reason provided'

    await booking.save()

    return createSuccessResponse(null, 'Booking cancelled successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
