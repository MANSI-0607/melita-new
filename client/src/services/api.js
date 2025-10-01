// API service for Melita e-commerce
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Create headers with auth token
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Authentication methods
  async sendOTP(phone, name, type = 'signup') {
    return this.post('/auth/send-otp', { phone, name, type });
  }

  async verifyOTP(phone, otp, type = 'signup') {
    return this.post('/auth/verify-otp', { phone, otp, type });
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  // Product methods
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    return this.get(endpoint);
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async getFeaturedProducts(limit = 8) {
    return this.get(`/products/featured?limit=${limit}`);
  }

  async searchProducts(query, limit = 20) {
    return this.get(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  // accepts either ObjectId or slug at `/:id`, and returns `{ success, data }`.
  async getProductidfromslug(slug) {
    const res = await this.get(`/products/${encodeURIComponent(slug)}`);
    const id = res?.data?._id;
    if (!id) throw new Error('Product not found for given slug');
    return id;
  }

  // Review methods
  async getProductReviews(productId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/reviews/product/${productId}?${queryString}` 
      : `/reviews/product/${productId}`;
    return this.get(endpoint);
  }

  async createReview(productId, reviewData) {
    return this.post(`/reviews/product/${productId}`, reviewData);
  }

  async updateReview(reviewId, reviewData) {
    return this.put(`/reviews/${reviewId}`, reviewData);
  }
  async deleteReview(reviewId) {
    return this.delete(`/reviews/${reviewId}`);
  }


  async canUserReview(productId) {
    return this.get(`/reviews/product/${productId}/can-review`);
  }

  // Order methods
  async createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  async getUserOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    return this.get(endpoint);
  }

  async getOrder(orderId) {
    return this.get(`/orders/${orderId}`);
  }

  async cancelOrder(orderId) {
    return this.patch(`/orders/${orderId}/cancel`);
  }

  // Profile methods
  async updateProfile(profileData) {
    return this.put('/profile', profileData);
  }

  async getDashboardData() {
    return this.get('/profile/dashboard');
  }

  // Address methods
  async getUserAddresses() {
    return this.get('/addresses');
  }

  async createAddress(addressData) {
    return this.post('/addresses', addressData);
  }

  async updateAddress(addressId, addressData) {
    return this.put(`/addresses/${addressId}`, addressData);
  }

  async deleteAddress(addressId) {
    return this.delete(`/addresses/${addressId}`);
  }

  async setDefaultAddress(addressId) {
    return this.patch(`/addresses/${addressId}/default`);
  }

  // Reward methods
  async getRewardBalance() {
    return this.get('/rewards/balance');
  }

  async getTransactionHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/rewards/transactions?${queryString}` : '/rewards/transactions';
    return this.get(endpoint);
  }

  async redeemPoints(points, orderId = null) {
    return this.post('/rewards/redeem', { points, orderId });
  }

  async getEarningOpportunities() {
    return this.get('/rewards/opportunities');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
