import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const SimpleProductReview = ({ slug }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/products/${slug}/reviews`);
        console.log("reveiw response");
        console.log(response);

        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          console.error('Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchReviews();
    }
  }, [slug]);

  // Check if user is logged in
  const isLoggedIn = () => {
    return localStorage.getItem('authToken') !== null;
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn()) {
      window.location.href = '/login';
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:5000/api/products/${slug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewForm)
      });

      if (response.ok) {
        // Refresh reviews
        const reviewsResponse = await fetch(`http://localhost:5000/api/products/${slug}/reviews`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);
        }
        
        setShowReviewModal(false);
        setReviewForm({ rating: 0, comment: '' });
        alert('Review submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <section id="reviews" className="max-w-7xl mx-auto rounded-2xl md:px-4">
        <div className="px-6 py-10 max-w-7xl mx-auto">
          <div className="text-center">Loading reviews...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="max-w-7xl mx-auto rounded-2xl md:px-4">
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <h2 className="text-center text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8">
          Customer Reviews
        </h2>

        {/* Rating Summary */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-600">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Write Review Button */}
        <div className="text-center mb-8">
          <Button
            onClick={() => setShowReviewModal(true)}
            className="bg-[#1e4323] hover:bg-[#2d5a3a] text-white px-6 py-2 rounded-lg"
          >
            Write a Review
          </Button>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review, index) => (
              <div key={index} className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{review.userName}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Review Modal */}
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="max-w-md">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Comment</label>
                <Textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with this product..."
                  required
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || reviewForm.rating === 0}
                  className="bg-[#1e4323] hover:bg-[#2d5a3a]"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default SimpleProductReview;
