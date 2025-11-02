// app/bookings/[id]/complete/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IPopulatedBookingForLawyer } from '@/types/models';

export default function CompleteBookingPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<IPopulatedBookingForLawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

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
      const response = await fetch(`/api/bookings/${params.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionNotes })
      });

      const data = await response.json();

      if (data.success) {
        alert('Session marked as completed!');
        router.push(`/bookings/${params.id}`);
      } else {
        alert(data.message || 'Failed to complete session');
      }
    } catch (error) {
      console.error('Error completing session:', error);
      alert('Failed to complete session');
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
          <h1 className="text-3xl font-bold">Complete Session</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Session Details</h2>
          <div className="space-y-2">
            <p>
              <span className="text-gray-600">Client:</span>{' '}
              <span className="font-medium">
                {client ? `${client.firstName} ${client.lastName}` : 'N/A'}
              </span>
            </p>
            <p>
              <span className="text-gray-600">Session Type:</span>{' '}
              <span className="font-medium">
                {booking.sessionType.split('-').map((w: string) => 
                  w.charAt(0).toUpperCase() + w.slice(1)
                ).join(' ')}
              </span>
            </p>
            <p>
              <span className="text-gray-600">Duration:</span>{' '}
              <span className="font-medium">
                {booking.durationType === 'full-hour' ? '60 minutes' : '30 minutes'}
              </span>
            </p>
            {booking.confirmedDateTime && (
              <p>
                <span className="text-gray-600">Date:</span>{' '}
                <span className="font-medium">
                  {new Date(booking.confirmedDateTime).toLocaleString('en-IN')}
                </span>
              </p>
            )}
            <p>
              <span className="text-gray-600">Amount:</span>{' '}
              <span className="font-medium">
                {booking.currency === 'INR' ? '₹' : '$'}{booking.amount}
              </span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>Complete Session:</strong> Mark this session as completed. Payment will be processed automatically.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Notes (Optional)
            </label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={8}
              maxLength={500}
              placeholder="Add any notes about the session, recommendations, or follow-up actions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <p className="text-xs text-gray-500 mt-1">
              {sessionNotes.length}/500 characters
            </p>
            <p className="text-xs text-gray-500 mt-1">
              These notes will be visible to the client
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Session will be marked as completed</li>
              <li>Payment status will be updated to Paid</li>
              <li>Your case count will be incremented</li>
              <li>Client can leave a review</li>
            </ul>
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
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {submitting ? 'Completing...' : 'Complete Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}