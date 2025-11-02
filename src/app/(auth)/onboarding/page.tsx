'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Scale, UserCircle, Briefcase } from 'lucide-react';
import LawyerOnboardingForm from '@/components/layout/forms/LawyerOnboardingForm';
import ClientOnboardingForm from '@/components/layout/forms/ClientOnboardingForm';
// import LawyerOnboardingForm from '@/components/forms/LawyerOnboardingForm';
// import ClientOnboardingForm from '@/components/forms/ClientOnboardingForm';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'client' | 'lawyer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch('/api/auth/check-role');
        if (response.ok) {
          const data = await response.json();
          if (data.data.onboardingCompleted) {
            // Redirect based on role
            if (data.data.role === 'lawyer') {
              router.push('/lawyer/dashboard');
            } else {
              router.push('/client/dashboard');
            }
          }
        }
      } catch (error) {
        console.error('Error checking onboarding:', error);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [user, isLoaded, router]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Scale className="h-16 w-16 text-blue-900 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to Legal Mate
            </h1>
            <p className="text-lg text-gray-600">
              Lets get you set up. Choose your account type
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Client Card */}
            <button
              onClick={() => setSelectedRole('client')}
              className="legal-card p-8 text-left hover:border-blue-900 hover:shadow-lg transition-all group"
            >
              <UserCircle className="h-16 w-16 text-blue-900 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                I m a Client
              </h3>
              <p className="text-gray-600 mb-4">
                Looking for legal assistance and want to connect with experienced lawyers
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Browse qualified lawyers</li>
                <li>✓ Book consultation sessions</li>
                <li>✓ Get expert legal advice</li>
                <li>✓ Leave reviews and ratings</li>
              </ul>
            </button>

            {/* Lawyer Card */}
            <button
              onClick={() => setSelectedRole('lawyer')}
              className="legal-card p-8 text-left hover:border-blue-900 hover:shadow-lg transition-all group"
            >
              <Briefcase className="h-16 w-16 text-blue-900 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                I m a Lawyer
              </h3>
              <p className="text-gray-600 mb-4">
                Offering legal services and want to connect with clients
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Create professional profile</li>
                <li>✓ Manage your availability</li>
                <li>✓ Accept client bookings</li>
                <li>✓ Build your reputation</li>
              </ul>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setSelectedRole(null)}
          className="mb-6 text-blue-900 hover:text-blue-800 font-medium"
        >
          ← Back to role selection
        </button>

        {selectedRole === 'lawyer' ? (
          <LawyerOnboardingForm/>
        ) : (
          <ClientOnboardingForm/>
        )}
      </div>
    </div>
  );
}