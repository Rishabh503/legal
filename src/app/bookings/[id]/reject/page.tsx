// app/bookings/[id]/reject/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IPopulatedBookingForLawyer } from '@/types/models';

export default function RejectBookingPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<IPopulatedBookingForLawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchBooking();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/bookings/${params.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (data.success) {
        alert('Booking rejected');
        router.push('/lawyer/dashboard');
      } else {
        alert(data.message || 'Failed to reject booking');
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking');
    } finally {
      setSubmitting(false);
    }
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
        <p className="text-gray-500">Booking not found</p>
      </div>
    );
  }

  const client = typeof booking.clientId === 'object' ? booking.clientId : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push(`/bookings/${params.id}`)}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back to booking
          </button>
          <h1 className="text-3xl font-bold">Reject Booking</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Booking Details</h2>
          <div className="space-y-2">
            <p>
              <span className="text-gray-600">Client:</span>{' '}
              <span className="font-medium">
                {client ? `${client.firstName} ${client.lastName}` : 'N/A'}
              </span>
            </p>
            <p>
              <span className="text-gray-600">Date:</span>{' '}
              <span className="font-medium">
                {new Date(booking.preferredDate).toLocaleDateString('en-IN')}
              </span>
            </p>
            <p>
              <span className="text-gray-600">Time:</span>{' '}
              <span className="font-medium">{booking.preferredTime}</span>
            </p>
            <p>
              <span className="text-gray-600">Amount:</span>{' '}
              <span className="font-medium">
                {booking.currency === 'INR' ? '₹' : '$'}{booking.amount}
              </span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action will reject the booking request. The client will be notified.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rejection *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={6}
              maxLength={500}
              placeholder="Please provide a reason for rejecting this booking..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/500 characters
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push(`/bookings/${params.id}`)}
              className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {submitting ? 'Rejecting...' : 'Reject Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}