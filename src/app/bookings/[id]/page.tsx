// app/bookings/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { IUserModel, UserRole } from '@/types/models';
import { Types } from 'mongoose';

interface IBookingDetail {
  _id: Types.ObjectId;
  clientId: IUserModel;
  lawyerId: {
    _id: Types.ObjectId;
    userId: IUserModel;
  };
  sessionType: 'consultation' | 'follow-up' | 'legal-advice' | 'case-review';
  durationType: 'half-hour' | 'full-hour';
  preferredDate: Date;
  preferredTime: string;
  confirmedDateTime?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  issueDescription: string;
  clientNotes?: string;
  lawyerNotes?: string;
  sessionNotes?: string;
  meetingLink?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<IBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    fetchBooking();
    fetchUserRole();
  }, [params.id]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setBooking(data.data);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/auth/check-role');
      const data = await response.json();
      if (data.success) {
        setUserRole(data.data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleApprove = () => {
    router.push(`/bookings/${params.id}/approve`);
  };

  const handleReject = () => {
    router.push(`/bookings/${params.id}/reject`);
  };

  const handleComplete = () => {
    router.push(`/bookings/${params.id}/complete`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Booking not found</h2>
          <button
            onClick={() => router.push('/bookings')}
            className="text-black underline"
          >
            Back to bookings
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSessionType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push(userRole === 'lawyer' ? '/lawyer/bookings' : '/client/bookings')}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back to bookings
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Booking Details</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Participant Info */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">
                {userRole === 'lawyer' ? 'Client Information' : 'Lawyer Information'}
              </h2>
              {userRole === 'lawyer' ? (
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600 overflow-hidden flex-shrink-0">
                    {booking.clientId.profileImage ? (
                      <Image
                        src={booking.clientId.profileImage}
                        alt={booking.clientId.firstName}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    ) : (
                      `${booking.clientId.firstName[0]}${booking.clientId.lastName[0]}`
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold">
                      {booking.clientId.firstName} {booking.clientId.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{booking.clientId.email}</p>
                    {booking.clientId.phone && (
                      <p className="text-sm text-gray-600">{booking.clientId.phone}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600 overflow-hidden flex-shrink-0">
                    {booking.lawyerId.userId.profileImage ? (
                      <Image
                        src={booking.lawyerId.userId.profileImage}
                        alt={booking.lawyerId.userId.firstName}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    ) : (
                      `${booking.lawyerId.userId.firstName[0]}${booking.lawyerId.userId.lastName[0]}`
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold">
                      {booking.lawyerId.userId.firstName} {booking.lawyerId.userId.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{booking.lawyerId.userId.email}</p>
                    {booking.lawyerId.userId.phone && (
                      <p className="text-sm text-gray-600">{booking.lawyerId.userId.phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Session Details */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Session Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Session Type</p>
                  <p className="font-medium">{formatSessionType(booking.sessionType)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-medium">
                    {booking.durationType === 'full-hour' ? '60 minutes' : '30 minutes'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Requested Date & Time</p>
                  <p className="font-medium">
                    {new Date(booking.preferredDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                  </p>
                  <p className="text-sm text-gray-600">{booking.preferredTime}</p>
                </div>
                {booking.confirmedDateTime && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Confirmed Date & Time</p>
                    <p className="font-medium">
                      {new Date(booking.confirmedDateTime).toLocaleString('en-IN', {
                        dateStyle: 'long',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Issue Description */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Issue Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{booking.issueDescription}</p>
            </div>

            {/* Client Notes */}
            {booking.clientNotes && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Client Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{booking.clientNotes}</p>
              </div>
            )}

            {/* Lawyer Notes */}
            {booking.lawyerNotes && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Lawyer Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{booking.lawyerNotes}</p>
              </div>
            )}

            {/* Session Notes */}
            {booking.sessionNotes && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Session Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{booking.sessionNotes}</p>
              </div>
            )}

            {/* Meeting Link */}
            {booking.meetingLink && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Meeting Link</h2>
                <a
                  href={booking.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {booking.meetingLink}
                </a>
              </div>
            )}

            {/* Cancellation Info */}
            {booking.status === 'cancelled' && booking.cancellationReason && (
              <div className="border border-red-200 bg-red-50 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-2 text-red-800">Cancellation Reason</h2>
                <p className="text-red-700">{booking.cancellationReason}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg p-6 sticky top-4 space-y-6">
              {/* Payment Info */}
              <div>
                <h3 className="font-bold mb-3">Payment Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-bold">
                      {booking.currency === 'INR' ? '₹' : '$'}{booking.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      booking.paymentStatus === 'refunded' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-bold mb-3">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-black rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium">Requested</p>
                      <p className="text-xs text-gray-600">
                        {new Date(booking.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-200 space-y-3">
                {userRole === 'lawyer' && booking.status === 'pending' && (
                  <>
                    <button
                      onClick={handleApprove}
                      className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
                    >
                      Approve Booking
                    </button>
                    <button
                      onClick={handleReject}
                      className="w-full py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-medium"
                    >
                      Reject Booking
                    </button>
                  </>
                )}

                {userRole === 'lawyer' && booking.status === 'approved' && (
                  <button
                    onClick={handleComplete}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Mark as Completed
                  </button>
                )}

                {booking.status === 'completed' && userRole === 'client' && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
                  >
                    Leave a Review
                  </button>
                )}

                {!['completed', 'cancelled', 'rejected'].includes(booking.status) && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <CancelModal
          bookingId={booking._id.toString()}
          onClose={() => setShowCancelModal(false)}
          onSuccess={fetchBooking}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          bookingId={booking._id.toString()}
          lawyerId={booking.lawyerId._id.toString()}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
}

// Cancel Modal
interface CancelModalProps {
  bookingId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function CancelModal({ bookingId, onClose, onSuccess }: CancelModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationReason: reason })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Cancel Booking</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for cancellation
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Please provide a reason..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Keep Booking
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Review Modal
interface ReviewModalProps {
  bookingId: string;
  lawyerId: string;
  onClose: () => void;
}

function ReviewModal({ bookingId, lawyerId, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          lawyerId,
          rating,
          reviewText
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Review submitted successfully!');
        onClose();
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Leave a Review</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl ${
                    star <= rating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Share your experience..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {reviewText.length}/1000 characters
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}