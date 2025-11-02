'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SESSION_TYPES, DURATION_TYPES } from '@/lib/utils/constants';
import { X } from 'lucide-react';

interface BookingFormProps {
  lawyerId: string;
  onCancel: () => void;
}

export default function BookingForm({ lawyerId, onCancel }: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sessionType: 'consultation',
    durationType: 'full-hour',
    preferredDate: '',
    preferredTime: '',
    issueDescription: '',
    clientNotes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lawyerId,
          ...formData
        })
      });

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        toast.error(bookingData.error || 'Failed to create booking');
        setLoading(false);
        return;
      }

      // Process fake payment
      const paymentResponse = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingData.data._id
        })
      });

      const paymentData = await paymentResponse.json();

      if (paymentResponse.ok) {
        toast.success('Booking created successfully! Payment processed.');
        router.push('/client/bookings');
      } else {
        toast.error('Booking created but payment failed');
        router.push('/client/bookings');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Book Consultation</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Session Type *
        </label>
        <select
          required
          value={formData.sessionType}
          onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
          className="legal-input text-sm"
        >
          {SESSION_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duration *
        </label>
        <select
          required
          value={formData.durationType}
          onChange={(e) => setFormData({ ...formData, durationType: e.target.value })}
          className="legal-input text-sm"
        >
          {DURATION_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Date *
        </label>
        <input
          type="date"
          required
          min={today}
          value={formData.preferredDate}
          onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
          className="legal-input text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Time *
        </label>
        <input
          type="time"
          required
          value={formData.preferredTime}
          onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
          className="legal-input text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Describe Your Legal Issue *
        </label>
        <textarea
          required
          value={formData.issueDescription}
          onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
          className="legal-input text-sm"
          rows={3}
          maxLength={2000}
          placeholder="Please provide details about your legal matter..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.issueDescription.length}/2000
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          value={formData.clientNotes}
          onChange={(e) => setFormData({ ...formData, clientNotes: e.target.value })}
          className="legal-input text-sm"
          rows={2}
          maxLength={500}
          placeholder="Any additional information..."
        />
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 legal-button disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Book & Pay'}
        </button>
      </div>
    </form>
  );
}