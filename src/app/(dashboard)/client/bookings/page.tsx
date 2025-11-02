'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Calendar, Filter } from 'lucide-react';
import { IPopulatedBookingForClient } from '@/types/models';

export default function ClientBookingsPage() {
  const [bookings, setBookings] = useState<IPopulatedBookingForClient[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<IPopulatedBookingForClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === filter));
    }
  }, [filter, bookings]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      
      if (response.ok) {
        setBookings(data.data);
        setFilteredBookings(data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    const reason = prompt('Please provide a cancellation reason:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationReason: reason })
      });

      if (response.ok) {
        toast.success('Booking cancelled successfully');
        fetchBookings();
      } else {
        toast.error('Failed to cancel booking');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.log(error)
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage all your consultation bookings</p>
        </div>

        {/* Filters */}
        <div className="legal-card p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="legal-input"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="legal-card p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              // Type guard to check if lawyerId is populated
              const lawyer = typeof booking.lawyerId !== 'object' ? null : booking.lawyerId;
              const lawyerUser = lawyer && typeof lawyer.userId === 'object' ? lawyer.userId : null;

              return (
                <div key={booking._id.toString()} className="legal-card p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {lawyerUser ? `${lawyerUser.firstName} ${lawyerUser.lastName}` : 'Lawyer Name Not Available'}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-gray-600 mb-2">
                        {booking.sessionType.charAt(0).toUpperCase() + booking.sessionType.slice(1).replace('-', ' ')} - {booking.durationType === 'half-hour' ? '30 minutes' : '60 minutes'}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>📅 {format(new Date(booking.preferredDate), 'MMM dd, yyyy')}</span>
                        <span>🕐 {booking.preferredTime}</span>
                        <span>💰 {booking.currency === 'INR' ? '₹' : '$'}{booking.amount}</span>
                        <span className={`font-medium ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                          Payment: {booking.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Issue Description:</h4>
                    <p className="text-gray-700 mb-3">{booking.issueDescription}</p>
                    
                    {booking.lawyerNotes && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <h4 className="font-medium text-gray-900 mb-1">Lawyer Notes:</h4>
                        <p className="text-gray-700 text-sm">{booking.lawyerNotes}</p>
                      </div>
                    )}

                    {booking.meetingLink && booking.status === 'approved' && (
                      <a
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-900 hover:underline text-sm font-medium"
                      >
                        🔗 Join Meeting
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(booking._id.toString())}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        Cancel Booking
                      </button>
                    )}
                    {booking.status === 'completed' && (
                      <a
                        href={`/client/bookings/${booking._id.toString()}/review`}
                        className="px-4 py-2 legal-button text-sm"
                      >
                        Leave Review
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}