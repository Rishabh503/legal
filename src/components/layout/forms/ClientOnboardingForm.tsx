'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LANGUAGES, SPECIALIZATIONS } from '@/lib/utils/constants';

export default function ClientOnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    preferredLanguages: [] as string[],
    legalIssueType: ''
  });

  const handleCheckbox = (value: string) => {
    setFormData(prev => ({
      ...prev,
      preferredLanguages: prev.preferredLanguages.includes(value)
        ? prev.preferredLanguages.filter(item => item !== value)
        : [...prev.preferredLanguages, value]
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log("Form submitted!"); // ADD THIS
  setLoading(true);

  try {
    const payload = {
      role: 'client',
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth || undefined,
      address: formData.address.street ? formData.address : undefined,
      preferredLanguages: formData.preferredLanguages,
      legalIssueType: formData.legalIssueType || undefined
    };

    console.log("Sending payload:", payload); // ADD THIS

    const response = await fetch('/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log("Response status:", response.status); // ADD THIS
    
    const data = await response.json();
    console.log("Response data:", data); // ADD THIS
    
    if (response.ok) {
      toast.success('Profile created successfully!');
      router.push('/');
      
    } else {
      toast.error(data.error || 'Failed to create profile');
    }
  } catch (error) {
    toast.error('An error occurred');
    console.error("Error:", error); // FIXED THIS
  } finally {
    setLoading(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="legal-card p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Client Profile Setup
        </h2>
        <p className="text-gray-600">
          Complete your profile to start connecting with lawyers
        </p>
      </div>

      {/* Contact */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="legal-input"
          placeholder="+91 9876543210"
        />
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date of Birth (Optional)
        </label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          className="legal-input"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Address (Optional)
        </label>
        <div className="space-y-3">
          <input
            type="text"
            value={formData.address.street}
            onChange={(e) => setFormData({
              ...formData,
              address: { ...formData.address, street: e.target.value }
            })}
            className="legal-input"
            placeholder="Street Address"
          />
          <div className="grid md:grid-cols-2 gap-3">
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, city: e.target.value }
              })}
              className="legal-input"
              placeholder="City"
            />
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, state: e.target.value }
              })}
              className="legal-input"
              placeholder="State"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              type="text"
              value={formData.address.zipCode}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, zipCode: e.target.value }
              })}
              className="legal-input"
              placeholder="ZIP Code"
            />
            <input
              type="text"
              value={formData.address.country}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, country: e.target.value }
              })}
              className="legal-input"
              placeholder="Country"
            />
          </div>
        </div>
      </div>

      {/* Preferred Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preferred Languages (Optional)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {LANGUAGES.map(lang => (
            <label key={lang} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.preferredLanguages.includes(lang)}
                onChange={() => handleCheckbox(lang)}
                className="rounded text-blue-900 focus:ring-blue-900"
              />
              <span className="text-sm text-gray-700">{lang}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Legal Issue Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What type of legal assistance do you need? (Optional)
        </label>
        <select
          value={formData.legalIssueType}
          onChange={(e) => setFormData({ ...formData, legalIssueType: e.target.value })}
          className="legal-input"
        >
          <option value="">Select an option</option>
          {SPECIALIZATIONS.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full legal-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Profile...' : 'Complete Profile Setup'}
      </button>
    </form>
  );
}