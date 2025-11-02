'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/layout/Navbar';
import BookingForm from '@/components/booking/BookingForm'; 
import ReviewList from '@/components/review/ReviewList'; 
import { Star, Briefcase, Award, Globe, GraduationCap, Mail, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ILawyerProfile, IReviewModel, IUserModel } from '@/types/models';

interface IPopulatedReview extends Omit<IReviewModel, 'clientId'> {
  clientId: IUserModel;
}

export default function LawyerDetailPage() {
  const params = useParams();
  const { isSignedIn } = useUser();
  const [lawyer, setLawyer] = useState<ILawyerProfile | null>(null);
  const [reviews, setReviews] = useState<IPopulatedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    fetchLawyerDetails();
    fetchReviews();
  }, [params.id]);

  const fetchLawyerDetails = async () => {
    try {
      const response = await fetch(`/api/lawyers/${params.id}`);
      const data = await response.json();
      if (response.ok) {
        setLawyer(data.data);
      }
    } catch (error) {
      console.error('Error fetching lawyer:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/lawyers/${params.id}/reviews`);
      const data = await response.json();
      if (response.ok) {
        setReviews(data.data.reviews || data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Lawyer not found</h1>
        </div>
      </div>
    );
  }

  const user = typeof lawyer.userId === 'object' ? lawyer.userId : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="legal-card p-8">
              <div className="flex items-start space-x-6">
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {user?.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={`${user.firstName} ${user.lastName}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-gray-600">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-medium text-gray-900">
                      {lawyer.averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({lawyer.totalReviews} reviews)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lawyer.specializations.map((spec: string) => (
                      <span
                        key={spec}
                        className="px-3 py-1 bg-blue-50 text-blue-900 text-sm font-medium rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="legal-card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{lawyer.about}</p>
            </div>

            {/* Experience & Stats */}
            <div className="legal-card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Experience & Credentials</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Briefcase className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{lawyer.yearsOfExperience}</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Award className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{lawyer.totalCasesSolved}</div>
                  <div className="text-sm text-gray-600">Cases Solved</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Star className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{lawyer.successRate}%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Globe className="h-5 w-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Languages</p>
                    <p className="text-gray-600">{lawyer.languagesSpoken.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award className="h-5 w-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Bar Registration</p>
                    <p className="text-gray-600">{lawyer.barRegistrationNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="legal-card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Education</h2>
              <div className="space-y-4">
                {lawyer.education.map((edu, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <GraduationCap className="h-5 w-5 text-blue-900 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{edu.degree}</p>
                      <p className="text-gray-600">{edu.university}</p>
                      <p className="text-sm text-gray-500">Graduated {edu.yearOfGraduation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="legal-card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Reviews ({lawyer.totalReviews})
              </h2>
              <ReviewList reviews={reviews} />
            </div>
          </div>

          {/* Sidebar - Booking */}
          <div className="lg:col-span-1">
            <div className="legal-card p-6 sticky top-24">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Consultation Fees</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">30 Minutes</span>
                    <span className="text-xl font-bold text-blue-900">
                      {lawyer.fees.currency === 'INR' ? '₹' : '$'}{lawyer.fees.perHalfHour}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">60 Minutes</span>
                    <span className="text-xl font-bold text-blue-900">
                      {lawyer.fees.currency === 'INR' ? '₹' : '$'}{lawyer.fees.perHour}
                    </span>
                  </div>
                </div>
              </div>

              {isSignedIn ? (
                <>
                  {!showBooking ? (
                    <button
                      onClick={() => setShowBooking(true)}
                      className="w-full legal-button"
                    >
                      Book Consultation
                    </button>
                  ) : (
                    <BookingForm
                      lawyerId={lawyer._id.toString()}
                      onCancel={() => setShowBooking(false)}
                    />
                  )}
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Sign in to book a consultation</p>
                  <Link href="/sign-in" className="legal-button block">
                    Sign In
                  </Link>
                </div>
              )}

              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {user?.email}
                </div>
                {user?.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {user.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}