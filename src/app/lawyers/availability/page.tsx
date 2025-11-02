// app/lawyer/availability/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Slot {
  startTime: string;
  endTime: string;
}

interface Availability {
  day: string;
  slots: Slot[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilityPage() {
  const router = useRouter();
  const [lawyerId, setLawyerId] = useState('');
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      // First get lawyer ID
      const profileResponse = await fetch('/api/lawyer/profile');
      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        setLawyerId(profileData.data._id);
        
        // Then get availability
        const response = await fetch(`/api/lawyers/${profileData.data._id}/availability`);
        const data = await response.json();
        
        if (data.success) {
          setAvailability(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDay = (day: string) => {
    setAvailability([
      ...availability,
      {
        day,
        slots: [{ startTime: '09:00', endTime: '17:00' }]
      }
    ]);
  };

  const removeDay = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const addSlot = (dayIndex: number) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots.push({ startTime: '09:00', endTime: '17:00' });
    setAvailability(newAvailability);
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots = newAvailability[dayIndex].slots.filter((_, i) => i !== slotIndex);
    setAvailability(newAvailability);
  };

  const updateSlot = (dayIndex: number, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots[slotIndex][field] = value;
    setAvailability(newAvailability);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/lawyers/${lawyerId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability })
      });

      const data = await response.json();

      if (data.success) {
        alert('Availability updated successfully!');
      } else {
        alert(data.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  const availableDays = DAYS.filter(day => !availability.find(a => a.day === day));

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/dashboard/lawyer')}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back to dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">Manage Availability</h1>
          <p className="text-gray-400">Set your weekly availability for consultations</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Set multiple time slots for each day if you have breaks. Clients will see these slots when booking consultations.
          </p>
        </div>

        {/* Add Day Dropdown */}
        {availableDays.length > 0 && (
          <div className="mb-6">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addDay(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">+ Add a day</option>
              {availableDays.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        )}

        {/* Availability List */}
        <div className="space-y-4">
          {availability.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg">
              <p className="text-gray-500 mb-4">No availability set yet</p>
              <p className="text-sm text-gray-600">Add days to start setting your schedule</p>
            </div>
          ) : (
            availability.map((avail, dayIndex) => (
              <div key={dayIndex} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{avail.day}</h3>
                  <button
                    onClick={() => removeDay(dayIndex)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Day
                  </button>
                </div>

                <div className="space-y-3">
                  {avail.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center gap-4">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateSlot(dayIndex, slotIndex, 'startTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">End Time</label>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateSlot(dayIndex, slotIndex, 'endTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      </div>
                      {avail.slots.length > 1 && (
                        <button
                          onClick={() => removeSlot(dayIndex, slotIndex)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addSlot(dayIndex)}
                  className="mt-4 text-sm text-black hover:underline"
                >
                  + Add time slot
                </button>
              </div>
            ))
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => router.push('/dashboard/lawyer')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || availability.length === 0}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium"
          >
            {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// app/reviews/create/page.tsx (or can be modal from booking detail)
