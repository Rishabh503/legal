import Link from 'next/link';
import { Star, Briefcase, MapPin, Globe } from 'lucide-react';
import Image from 'next/image';

interface LawyerCardProps {
  lawyer: any;
}

export default function LawyerCard({ lawyer }: LawyerCardProps) {
  const user = lawyer.userId;

  return (
    <Link href={`/lawyers/${lawyer._id}`}>
      <div className="legal-card p-6 hover:border-blue-900 transition-all cursor-pointer h-full">
        {/* Profile */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {user?.profileImage ? (
              <></>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-gray-600">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </h3>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-900">
                {lawyer.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({lawyer.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {lawyer.specializations.slice(0, 2).map((spec: string) => (
              <span
                key={spec}
                className="px-3 py-1 bg-blue-50 text-blue-900 text-xs font-medium rounded-full"
              >
                {spec}
              </span>
            ))}
            {lawyer.specializations.length > 2 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{lawyer.specializations.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{lawyer.yearsOfExperience} years experience</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {lawyer.languagesSpoken.slice(0, 2).join(', ')}
              {lawyer.languagesSpoken.length > 2 && ` +${lawyer.languagesSpoken.length - 2}`}
            </span>
          </div>
        </div>

        {/* About */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {lawyer.about}
        </p>

        {/* Fees */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Starting from</p>
              <p className="text-lg font-bold text-blue-900">
                {lawyer.fees.currency === 'INR' ? '₹' : '$'}{lawyer.fees.perHalfHour}
                <span className="text-sm font-normal text-gray-600">/30 min</span>
              </p>
            </div>
            <button className="legal-button text-sm px-4 py-2">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}