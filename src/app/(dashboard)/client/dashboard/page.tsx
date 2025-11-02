'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/layout/Navbar';
import { Calendar, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { IPopulatedBookingForClient } from '@/types/models';

export default function ClientDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<IPopulatedBookingForClient[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    completed: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      checkOnboarding();
      fetchBookings();
    }
  }, [isLoaded]);

  const checkOnboarding = async () => {
    try {
      const response = await fetch('/api/auth/check-role');
      if (response.ok) {
        const data = await response.json();
        if (!data.data.onboardingCompleted) {
          router.push('/onboarding');
        } else if (data.data.role !== 'client') {
          router.push('/lawyer/dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking role:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      
      if (response.ok) {
        setBookings(data.data);
        
        // Calculate stats
        const stats = {
          pending: data.data.filter((b: IPopulatedBookingForClient) => b.status === 'pending').length,
          approved: data.data.filter((b: IPopulatedBookingForClient) => b.status === 'approved').length,
          completed: data.data.filter((b: IPopulatedBookingForClient) => b.status === 'completed').length,
          cancelled: data.data.filter((b: IPopulatedBookingForClient) => b.status === 'cancelled' || b.status === 'rejected').length
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
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

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Manage your bookings and find legal assistance
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="legal-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-600 opacity-20" />
            </div>
          </div>

          <div className="legal-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="legal-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="legal-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cancelled</p>
                <p className="text-3xl font-bold text-gray-600">{stats.cancelled}</p>
              </div>
              <XCircle className="h-10 w-10 text-gray-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="legal-card p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/lawyers" className="legal-button flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Find Lawyers
            </Link>
            <Link href="/client/bookings" className="bg-white border-2 border-blue-900 text-blue-900 px-6 py-2.5 rounded-md font-medium hover:bg-blue-50 transition-colors">
              View All Bookings
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="legal-card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
          
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No bookings yet</p>
              <Link href="/lawyers" className="legal-button inline-block">
                Find a Lawyer
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => {
                // Type guard to check if lawyerId is populated
                const lawyer = typeof booking.lawyerId !== 'object' ? null : booking.lawyerId;
                const lawyerUser = lawyer && typeof lawyer.userId === 'object' ? lawyer.userId : null;

                return (
                  <div key={booking._id.toString()} className="border border-gray-200 rounded-lg p-4 hover:border-blue-900 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {lawyerUser ? `${lawyerUser.firstName} ${lawyerUser.lastName}` : 'Lawyer Name Not Available'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {booking.sessionType.charAt(0).toUpperCase() + booking.sessionType.slice(1).replace('-', ' ')} - {booking.durationType === 'half-hour' ? '30 min' : '60 min'}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span>📅 {format(new Date(booking.preferredDate), 'MMM dd, yyyy')}</span>
                      <span>🕐 {booking.preferredTime}</span>
                      <span>💰 {booking.currency === 'INR' ? '₹' : '$'}{booking.amount}</span>
                    </div>
                    {booking.status === 'completed' && (
                      <Link 
                        href={`/client/bookings/${booking._id.toString()}/review`}
                        className="text-sm text-blue-900 hover:underline mt-2 inline-block"
                      >
                        Leave a Review
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}