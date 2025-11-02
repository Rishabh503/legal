'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/layout/Navbar';
import { Calendar, Clock, CheckCircle, Star, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { IPopulatedBookingForLawyer, ILawyerProfile } from '@/types/models';

export default function LawyerDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<IPopulatedBookingForLawyer[]>([]);
  const [profile, setProfile] = useState<ILawyerProfile | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    completed: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      checkOnboarding();
      fetchData();
    }
  }, [isLoaded]);

  const checkOnboarding = async () => {
    try {
      const response = await fetch('/api/auth/check-role');
      if (response.ok) {
        const data = await response.json();
        if (!data.data.onboardingCompleted) {
          router.push('/onboarding');
        } else if (data.data.role !== 'lawyer') {
          router.push('/client/dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking role:', error);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch bookings
      const bookingsResponse = await fetch('/api/bookings');
      const bookingsData = await bookingsResponse.json();
      
      if (bookingsResponse.ok) {
        setBookings(bookingsData.data);
        
        // Calculate stats
        const completed = bookingsData.data.filter((b: IPopulatedBookingForLawyer) => b.status === 'completed');
        const totalEarnings = completed.reduce((sum: number, b: IPopulatedBookingForLawyer) => sum + b.amount, 0);
        
        setStats({
          pending: bookingsData.data.filter((b: IPopulatedBookingForLawyer) => b.status === 'pending').length,
          approved: bookingsData.data.filter((b: IPopulatedBookingForLawyer) => b.status === 'approved').length,
          completed: completed.length,
          totalEarnings
        });
      }

      // Fetch profile
      const profileResponse = await fetch('/api/users');
      const profileData = await profileResponse.json();
      if (profileResponse.ok) {
        setProfile(profileData.data.profile);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId: string) => {
    const confirmedDateTime = prompt('Enter confirmed date and time (YYYY-MM-DD HH:MM):');
    if (!confirmedDateTime) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmedDateTime })
      });

      if (response.ok) {
        toast.success('Booking approved!');
        fetchData();
      } else {
        toast.error('Failed to approve booking');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.log(error)
    }
  };

  const handleReject = async (bookingId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast.success('Booking rejected');
        fetchData();
      } else {
        toast.error('Failed to reject booking');
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
            Manage your bookings and client consultations
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
                <p className="text-sm text-gray-600 mb-1">Earnings</p>
                <p className="text-3xl font-bold text-green-600">₹{stats.totalEarnings}</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        {profile && (
          <div className="legal-card p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Profile Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{profile.averageRating.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{profile.totalReviews}</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{profile.totalCasesSolved}</p>
                <p className="text-sm text-gray-600">Cases Solved</p>
              </div>
              <div className="text-center">
                <Star className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{profile.successRate}%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="legal-card p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/lawyer/bookings" className="legal-button">
              View All Bookings
            </Link>
            <Link href="/lawyer/profile" className="bg-white border-2 border-blue-900 text-blue-900 px-6 py-2.5 rounded-md font-medium hover:bg-blue-50 transition-colors">
              Edit Profile
            </Link>
            <Link href="/lawyer/reviews" className="bg-white border-2 border-blue-900 text-blue-900 px-6 py-2.5 rounded-md font-medium hover:bg-blue-50 transition-colors">
              View Reviews
            </Link>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="legal-card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Pending Booking Requests</h2>
          
          {bookings.filter(b => b.status === 'pending').length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No pending bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.filter(b => b.status === 'pending').map((booking) => {
                // Type guard to check if clientId is populated
                const client = typeof booking.clientId === 'object' ? booking.clientId : null;

                return (
                  <div key={booking._id.toString()} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {client ? `${client.firstName} ${client.lastName}` : 'Client Name Not Available'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {booking.sessionType.charAt(0).toUpperCase() + booking.sessionType.slice(1).replace('-', ' ')} - {booking.durationType === 'half-hour' ? '30 min' : '60 min'}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Issue:</strong> {booking.issueDescription}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 space-x-4 mb-3">
                      <span>📅 {format(new Date(booking.preferredDate), 'MMM dd, yyyy')}</span>
                      <span>🕐 {booking.preferredTime}</span>
                      <span>💰 {booking.currency === 'INR' ? '₹' : '$'}{booking.amount}</span>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprove(booking._id.toString())}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(booking._id.toString())}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
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