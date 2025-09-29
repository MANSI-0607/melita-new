import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';

export const useProductReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchReviews = async (params = {}) => {
    try {
      setLoading(true);
      console.log('Fetching reviews for product:', productId);
      const response = await apiService.getProductReviews(productId, params);
      console.log('Reviews API response:', response);
      setReviews(response.data.reviews);
      setStats(response.data.stats);
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  return {
    reviews,
    stats,
    loading,
    error,
    refetch: fetchReviews,
  };
};

export const useCreateReview = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createReview = async (productId, reviewData) => {
    try {
      setLoading(true);
      const response = await apiService.createReview(productId, reviewData);
      
      toast({
        title: "Success",
        description: response.message || "Review submitted successfully!",
      });
      
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createReview,
    loading,
  };
};

export const useCanUserReview = (productId) => {
  const [canReview, setCanReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [verified, setVerified] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkCanReview = async () => {
    try {
      setLoading(true);
      const response = await apiService.canUserReview(productId);
      setCanReview(response.data.canReview);
      setHasPurchased(response.data.hasPurchased);
      setVerified(response.data.verified);
      setExistingReview(response.data.existingReview);
    } catch (error) {
      console.error('Failed to check review eligibility:', error);
      setCanReview(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      checkCanReview();
    }
  }, [productId]);

  return {
    canReview,
    hasPurchased,
    verified,
    existingReview,
    loading,
    refetch: checkCanReview,
  };
};

