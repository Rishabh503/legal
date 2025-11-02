import { Star } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

interface ReviewListProps {
  reviews: any[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        No reviews yet. Be the first to leave a review!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review: any) => (
        <div key={review._id} className="border-b pb-6 last:border-b-0">
          {/* Reviewer Info */}
          <div className="flex items-start space-x-3 mb-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {review.clientId?.profileImage ? (
                <Image
                  src={review.clientId.profileImage}
                  alt={`${review.clientId.firstName} ${review.clientId.lastName}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm font-bold text-gray-600">
                  {review.clientId?.firstName?.[0]}{review.clientId?.lastName?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">
                  {review.clientId?.firstName} {review.clientId?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Review Text */}
          <p className="text-gray-700 leading-relaxed mb-3">
            {review.reviewText}
          </p>

          {/* Lawyer Response */}
          {review.lawyerResponse && (
            <div className="bg-gray-50 rounded-lg p-4 ml-8">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Response from Lawyer
              </p>
              <p className="text-sm text-gray-700">
                {review.lawyerResponse}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {format(new Date(review.respondedAt), 'MMM dd, yyyy')}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}