import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useProductReviews, useCreateReview, useCanUserReview } from '@/hooks/useReviews';
import { getBackendProductIdFromSlug } from '@/utils/productMapping';

const ProductReview = ({ productId, productSlug }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    title: '',
    reviewText: '',
    rating: 0
  });
  const { toast } = useToast();

  // Get backend product ID from slug if productId is not provided
  const backendProductId = productId || getBackendProductIdFromSlug(productSlug);

  // API hooks
  const { reviews, stats, loading, error, refetch } = useProductReviews(backendProductId);
  const { createReview, loading: creatingReview } = useCreateReview();
  const { canReview, hasPurchased, verified, existingReview, loading: checkingReview } = useCanUserReview(backendProductId);

  // Use stats from API or fallback to calculated values
  const totalReviews = stats?.totalReviews || reviews.length;
  const averageRating = stats?.averageRating || 
    (reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0);

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = stats?.ratingDistribution?.[`${star === 5 ? 'five' : star === 4 ? 'four' : star === 3 ? 'three' : star === 2 ? 'two' : 'one'}`] || 
      reviews.filter((r) => r.rating === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase() || 'U';

  // Handle form submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!canReview) {
      toast({
        title: "Cannot Review",
        description: "You cannot review this product",
        variant: "destructive",
      });
      return;
    }

    try {
      await createReview(productId, {
        rating: reviewForm.rating,
        title: reviewForm.title,
        reviewText: reviewForm.reviewText
      });

      // Reset form and close modal
      setReviewForm({ title: '', reviewText: '', rating: 0 });
      setUserRating(0);
      setShowReviewModal(false);
      
      // Refresh reviews
      refetch();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };


  // Handle input changes
  const handleInputChange = (field, value) => {
    setReviewForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Show loading state
  if (loading) {
    return (
      <section id="reviews" className="max-w-7xl mx-auto rounded-2xl md:px-4">
        <div className="px-6 py-10 max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-4">Loading reviews...</div>
            <div className="text-sm text-gray-500">Product ID: {backendProductId}</div>
            <div className="text-sm text-gray-500">Slug: {productSlug}</div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section id="reviews" className="max-w-7xl mx-auto rounded-2xl md:px-4">
        <div className="px-6 py-10 max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-4 text-red-600">Error loading reviews: {error}</div>
            <div className="text-sm text-gray-500">Product ID: {backendProductId}</div>
            <div className="text-sm text-gray-500">Slug: {productSlug}</div>
            <button 
              onClick={refetch}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="max-w-7xl mx-auto rounded-2xl md:px-4">
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <h2 className="text-center text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8">
          CUSTOMER REVIEWS
        </h2>

        {/* Average Rating + CTA */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <div
              className="flex text-yellow-400"
              title={`${averageRating.toFixed(2)} out of 5 stars`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  fill="currentColor"
                  stroke="currentColor"
                />
              ))}
            </div>
            <p className="text-gray-700 text-base">
              Based on {totalReviews} reviews
            </p>
          </div>
          <Button
            onClick={() => setShowReviewModal(true)}
            disabled={!canReview || checkingReview}
            className="font-headingTwo text-base text-white bg-[#835339] border border-[#835339] px-6 py-2 rounded hover:bg-[#6f462f] transition disabled:opacity-50"
          >
            {checkingReview ? 'Checking...' : 
             existingReview ? 'Edit Review' : 
             !canReview ? 'Cannot Review' : 'Write a review'}
          </Button>
        </div>

        {/* Rating Distribution */}
        <div className="mb-6">
          <div className="space-y-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm text-gray-700 w-14">{star} star</span>
                <div className="bg-gray-200 w-full md:w-40 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-700 w-20 text-right">
                  {percentage.toFixed(0)}% ({count})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="mt-6 border-t border-[#ccd5ae] pt-6 space-y-8">
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="flex gap-5">
                <div className="w-12 h-12 rounded-full bg-[#835339] flex-shrink-0 flex items-center justify-center font-bold text-white text-lg">
                  {getInitials(review.user?.name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            fill="currentColor"
                            stroke="currentColor"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{review.dateDisplay}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {review.verified && (
                      <span className="text-xs bg-yellow-400 text-white px-2 py-0.5 rounded-full font-semibold">
                        Verified
                      </span>
                    )}
                    <span className="text-sm font-bold text-[#5c4b2c]">
                      {review.user?.name || 'Anonymous'}
                    </span>
                  </div>
                  <h4 className="text-text-secondary font-headingTwo font-semibold text-lg mt-2">
                    {review.title}
                  </h4>
                  <p className="text-sm text-gray-700 mt-1">{review.reviewText}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full">
          <h3 className="text-xl font-headingOne font-semibold text-[#835339] mb-4">
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </h3>
          
          {!canReview && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                {existingReview 
                  ? 'You have already reviewed this product.' 
                  : 'You need to purchase this product to write a review.'}
              </p>
            </div>
          )}

          {verified && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✓ Verified purchase - You'll earn 50 reward points for your review!
              </p>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700">
                Your Rating *
              </Label>
              <div className="flex items-center gap-1 text-yellow-400 mt-1">
                {[...Array(5)].map((_, i) => (
                  <label
                    key={i}
                    htmlFor={`star${i + 1}`}
                    className="cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={i + 1}
                      name="rating"
                      id={`star${i + 1}`}
                      className="sr-only"
                      required
                      checked={reviewForm.rating === i + 1}
                      onChange={(e) => {
                        setUserRating(parseInt(e.target.value));
                        handleInputChange('rating', parseInt(e.target.value));
                      }}
                    />
                    <Star
                      size={24}
                      fill={i < reviewForm.rating ? "currentColor" : "none"}
                      stroke="currentColor"
                      className={
                        i < reviewForm.rating
                          ? "text-yellow-400"
                          : "text-gray-300 hover:text-yellow-400"
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Review Title *
              </Label>
              <Input
                id="title"
                value={reviewForm.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Summarize your experience"
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="review_text" className="block text-sm font-medium text-gray-700">
                Your Review *
              </Label>
              <Textarea
                id="review_text"
                value={reviewForm.reviewText}
                onChange={(e) => handleInputChange('reviewText', e.target.value)}
                rows={4}
                placeholder="Share your detailed experience with this product..."
                className="mt-1"
                required
              />
            </div>
            
            <div className="flex justify-end pt-2 space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReviewModal(false)}
                disabled={creatingReview}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creatingReview || !canReview || reviewForm.rating === 0}
                className="font-headingTwo text-base text-white bg-[#835339] border border-[#835339] px-6 py-2 rounded hover:bg-[#6f462f] transition disabled:opacity-50"
              >
                {creatingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProductReview;
