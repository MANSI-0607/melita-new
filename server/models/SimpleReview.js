import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Review = mongoose.model('SimpleReview', reviewSchema);
export default Review;
