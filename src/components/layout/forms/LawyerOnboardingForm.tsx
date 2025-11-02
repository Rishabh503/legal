'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { SPECIALIZATIONS, LANGUAGES, DEGREES, CURRENCIES } from '@/lib/utils/constants';

export default function LawyerOnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [education, setEducation] = useState([
    { degree: '', university: '', yearOfGraduation: '' }
  ]);

  const [formData, setFormData] = useState({
    phone: '',
    barRegistrationNumber: '',
    yearsOfExperience: '',
    specializations: [] as string[],
    languagesSpoken: [] as string[],
    totalCasesSolved: '',
    successRate: '',
    about: '',
    perHour: '',
    perHalfHour: '',
    currency: 'INR'
  });

  const handleEducationChange = (index: number, field: string, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const addEducation = () => {
    setEducation([...education, { degree: '', university: '', yearOfGraduation: '' }]);
  };

  const removeEducation = (index: number) => {
    if (education.length > 1) {
      setEducation(education.filter((_, i) => i !== index));
    }
  };

  const handleCheckbox = (field: 'specializations' | 'languagesSpoken', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate education
      const validEducation = education.filter(
        edu => edu.degree && edu.university && edu.yearOfGraduation
      );

      if (validEducation.length === 0) {
        toast.error('Please add at least one education entry');
        setLoading(false);
        return;
      }

      const payload = {
        role: 'lawyer',
        phone: formData.phone,
        barRegistrationNumber: formData.barRegistrationNumber,
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        specializations: formData.specializations,
        languagesSpoken: formData.languagesSpoken,
        education: validEducation.map(edu => ({
          ...edu,
          yearOfGraduation: parseInt(edu.yearOfGraduation)
        })),
        totalCasesSolved: parseInt(formData.totalCasesSolved) || 0,
        successRate: parseFloat(formData.successRate) || 0,
        about: formData.about,
        perHour: parseFloat(formData.perHour),
        perHalfHour: parseFloat(formData.perHalfHour),
        currency: formData.currency
      };

      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Profile created successfully!');
        router.push('/');
      } else {
        toast.error(data.error || 'Failed to create profile');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="legal-card p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Lawyer Profile Setup
        </h2>
        <p className="text-gray-600">
          Complete your professional profile to start receiving clients
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

      {/* Bar Registration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bar Registration Number *
        </label>
        <input
          type="text"
          required
          value={formData.barRegistrationNumber}
          onChange={(e) => setFormData({ ...formData, barRegistrationNumber: e.target.value })}
          className="legal-input"
          placeholder="BAR/2020/12345"
        />
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Years of Experience *
        </label>
        <input
          type="number"
          required
          min="0"
          value={formData.yearsOfExperience}
          onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
          className="legal-input"
        />
      </div>

      {/* Specializations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Specializations * (Select at least one)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SPECIALIZATIONS.map(spec => (
            <label key={spec} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.specializations.includes(spec)}
                onChange={() => handleCheckbox('specializations', spec)}
                className="rounded text-blue-900 focus:ring-blue-900"
              />
              <span className="text-sm text-gray-700">{spec}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Languages Spoken * (Select at least one)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {LANGUAGES.map(lang => (
            <label key={lang} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.languagesSpoken.includes(lang)}
                onChange={() => handleCheckbox('languagesSpoken', lang)}
                className="rounded text-blue-900 focus:ring-blue-900"
              />
              <span className="text-sm text-gray-700">{lang}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Education * (At least one required)
          </label>
          <button
            type="button"
            onClick={addEducation}
            className="text-blue-900 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" /> Add More
          </button>
        </div>
        {education.map((edu, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
              {education.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              <select
                value={edu.degree}
                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                className="legal-input"
                required
              >
                <option value="">Select Degree</option>
                {DEGREES.map(degree => (
                  <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
              <input
                type="text"
                value={edu.university}
                onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                className="legal-input"
                placeholder="University Name"
                required
              />
              <input
                type="number"
                value={edu.yearOfGraduation}
                onChange={(e) => handleEducationChange(index, 'yearOfGraduation', e.target.value)}
                className="legal-input"
                placeholder="Year of Graduation"
                min="1950"
                max={new Date().getFullYear()}
                required
              />
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Cases Solved
          </label>
          <input
            type="number"
            min="0"
            value={formData.totalCasesSolved}
            onChange={(e) => setFormData({ ...formData, totalCasesSolved: e.target.value })}
            className="legal-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Success Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.successRate}
            onChange={(e) => setFormData({ ...formData, successRate: e.target.value })}
            className="legal-input"
          />
        </div>
      </div>

      {/* About */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          About You *
        </label>
        <textarea
          required
          value={formData.about}
          onChange={(e) => setFormData({ ...formData, about: e.target.value })}
          className="legal-input"
          rows={4}
          maxLength={1000}
          placeholder="Tell clients about your expertise, experience, and approach..."
        />
        <p className="text-xs text-gray-500 mt-1">{formData.about.length}/1000</p>
      </div>

      {/* Fees */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Consultation Fees *
        </label>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="legal-input"
            >
              {CURRENCIES.map(curr => (
                <option key={curr.value} value={curr.value}>{curr.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Per Hour</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.perHour}
              onChange={(e) => setFormData({ ...formData, perHour: e.target.value })}
              className="legal-input"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Per 30 Minutes</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.perHalfHour}
              onChange={(e) => setFormData({ ...formData, perHalfHour: e.target.value })}
              className="legal-input"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || formData.specializations.length === 0 || formData.languagesSpoken.length === 0}
        className="w-full legal-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Profile...' : 'Complete Profile Setup'}
      </button>
    </form>
  );
}