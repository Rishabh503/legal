'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Search, Filter, Star, MapPin, Briefcase, Languages } from 'lucide-react';
import { ILawyerProfile } from '@/types/models';

export default function LawyersListingPage() {
  const router = useRouter();
  const [lawyers, setLawyers] = useState<ILawyerProfile[]>([]);
  const [filteredLawyers, setFilteredLawyers] = useState<ILawyerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'price'>('rating');

  useEffect(() => {
    fetchLawyers();
  }, []);

  useEffect(() => {
    filterLawyers();
  }, [lawyers, searchQuery, selectedSpecialization, minRating, sortBy]);

  const fetchLawyers = async () => {
    try {
      const response = await fetch('/api/lawyers');
      const data = await response.json();
      
      if (response.ok) {
        setLawyers(data.data);
        setFilteredLawyers(data.data);
      }
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLawyers = () => {
    let filtered = [...lawyers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(lawyer => {
        const user = typeof lawyer.userId === 'object' ? lawyer.userId : null;
        const fullName = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : '';
        const specs = lawyer.specializations.join(' ').toLowerCase();
        const query = searchQuery.toLowerCase();
        
        return fullName.includes(query) || specs.includes(query);
      });
    }

    // Specialization filter
    if (selectedSpecialization) {
      filtered = filtered.filter(lawyer =>
        lawyer.specializations.some(spec => 
          spec.toLowerCase().includes(selectedSpecialization.toLowerCase())
        )
      );
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(lawyer => lawyer.averageRating >= minRating);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        return b.averageRating - a.averageRating;
      } else if (sortBy === 'experience') {
        return b.yearsOfExperience - a.yearsOfExperience;
      } else {
        return a.fees.perHour - b.fees.perHour;
      }
    });

    setFilteredLawyers(filtered);
  };

  const getAllSpecializations = () => {
    const specs = new Set<string>();
    lawyers.forEach(lawyer => {
      lawyer.specializations.forEach(spec => specs.add(spec));
    });
    return Array.from(specs).sort();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find a Lawyer</h1>
          <p className="text-gray-600">
            Browse through {lawyers.length} verified lawyers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="legal-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or specialization..."
                className="legal-input pl-10"
              />
            </div>

            {/* Specialization Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="legal-input pl-10"
              >
                <option value="">All Specializations</option>
                {getAllSpecializations().map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="legal-input"
            >
              <option value="0">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'experience' | 'price')}
              className="legal-input"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="price">Lowest Price</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {filteredLawyers.length === 0 ? (
          <div className="legal-card p-12 text-center">
            <p className="text-gray-600 mb-4">No lawyers found matching your criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialization('');
                setMinRating(0);
              }}
              className="text-blue-900 hover:underline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLawyers.map((lawyer) => {
              const user = typeof lawyer.userId === 'object' ? lawyer.userId : null;

              return (
                <div
                  key={lawyer._id.toString()}
                  className="legal-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/lawyers/${lawyer._id.toString()}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {user ? `${user.firstName} ${user.lastName}` : 'Lawyer'}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(Math.round(lawyer.averageRating))}
                        <span className="text-sm text-gray-600">
                          ({lawyer.totalReviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {lawyer.yearsOfExperience} years experience
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Languages className="h-4 w-4 mr-2" />
                      {lawyer.languagesSpoken.slice(0, 2).join(', ')}
                      {lawyer.languagesSpoken.length > 2 && ` +${lawyer.languagesSpoken.length - 2}`}
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {lawyer.specializations.slice(0, 3).map((spec, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-900 text-xs rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                      {lawyer.specializations.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{lawyer.specializations.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Starting from</p>
                        <p className="text-lg font-bold text-blue-900">
                          {lawyer.fees.currency === 'INR' ? '₹' : '$'}
                          {lawyer.fees.perHalfHour}
                          <span className="text-sm font-normal text-gray-600">/30 min</span>
                        </p>
                      </div>
                      <button className="legal-button text-sm">
                        View Profile
                      </button>
                    </div>
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