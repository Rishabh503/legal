// app/bookings/[id]/approve/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IPopulatedBookingForLawyer } from '@/types/models';

export default function ApproveBookingPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<IPopulatedBookingForLawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    confirmedDate: '',
    confirmedTime: '',
    meetingLink: '',
    lawyerNotes: ''
  });

  useEffect(() => {
    fetchBooking();
  }, [params.id]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setBooking(data.data);
        // Pre-fill with requested date and time
        const preferredDate = new Date(data.data.preferredDate);
        setFormData(prev => ({
          ...prev,
          confirmedDate: preferredDate.toISOString().split('T')[0],
          confirmedTime: data.data.preferredTime
        }));
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
      const confirmedDateTime = new Date(`${formData.confirmedDate}T${formData.confirmedTime}`);

      const response = await fetch(`/api/bookings/${params.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmedDateTime: confirmedDateTime.toISOString(),
          meetingLink: formData.meetingLink,
          lawyerNotes: formData.lawyerNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Booking approved successfully!');
        router.push(`/bookings/${params.id}`);
      } else {
        alert(data.message || 'Failed to approve booking');
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Failed to approve booking');
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push(`/bookings/${params.id}`)}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back to booking
          </button>
          <h1 className="text-3xl font-bold">Approve Booking</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Client Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Client Name</p>
              <p className="font-medium">
                {client ? `${client.firstName} ${client.lastName}` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-medium">{client?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Session Type</p>
              <p className="font-medium">
                {booking.sessionType.split('-').map((w: string) => 
                  w.charAt(0).toUpperCase() + w.slice(1)
                ).join(' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="font-medium">
                {booking.durationType === 'full-hour' ? '60 minutes' : '30 minutes'}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Issue Description</p>
            <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
              {booking.issueDescription}
            </p>
          </div>

          {booking.clientNotes && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Client Notes</p>
              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                {booking.clientNotes}
              </p>
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Requested Date & Time</p>
            <p className="font-medium">
              {new Date(booking.preferredDate).toLocaleDateString('en-IN', { dateStyle: 'long' })} at {booking.preferredTime}
            </p>
          </div>
        </div>

        {/* Approval Form */}
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Confirm Session Details</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmed Date *
              </label>
              <input
                type="date"
                value={formData.confirmedDate}
                onChange={(e) => setFormData({ ...formData, confirmedDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Pre-filled with client s requested date
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmed Time *
              </label>
              <input
                type="time"
                value={formData.confirmedTime}
                onChange={(e) => setFormData({ ...formData, confirmedTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Pre-filled with client s requested time
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Link (Optional)
            </label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              placeholder="https://meet.google.com/xxx-xxxx-xxx or Zoom link"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide a Google Meet, Zoom, or other video call link
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes for Client (Optional)
            </label>
            <textarea
              value={formData.lawyerNotes}
              onChange={(e) => setFormData({ ...formData, lawyerNotes: e.target.value })}
              rows={4}
              maxLength={500}
              placeholder="Any instructions or information for the client..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.lawyerNotes.length}/500 characters
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> By approving this booking, you confirm your availability for the session. 
              The client will be notified via email with the confirmed details.
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
              className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium"
            >
              {submitting ? 'Approving...' : 'Approve Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}