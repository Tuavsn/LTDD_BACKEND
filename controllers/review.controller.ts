import Review, { IReview } from '../models/review.model';
import Product from '../models/product.model';
import mongoose, { ClientSession } from 'mongoose';

interface ReviewData {
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  images?: Array<{ url: string }>;
}

interface ReviewQueryOptions {
  page?: number;
  limit?: number;
  rating?: number | null;
}

interface PaginatedReviewResult {
  reviews: IReview[];
  totalPages: number;
  currentPage: number;
  total: number;
}

class ReviewController {
    async createReview(reviewData: ReviewData): Promise<IReview> {
        const session: ClientSession = await mongoose.startSession();
        session.startTransaction();
        try {
            // Create the review
            const review = await Review.create([reviewData], { session });
            
            // Update product rating and counts
            const productId = reviewData.productId;
            const rating = reviewData.rating;
            
            // Update the product's rating counts
            await Product.findByIdAndUpdate(
                productId,
                {
                    $inc: {
                        [`ratingCounts.${rating}`]: 1,
                        reviewCount: 1
                    }
                },
                { session }
            );
            
            // Calculate new average rating
            const allReviews = await Review.find({ productId });
            const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
            const newAvgRating = allReviews.length > 0 ? totalRating / allReviews.length : reviewData.rating;
            
            // Update product's average rating
            await Product.findByIdAndUpdate(
                productId,
                { rating: newAvgRating },
                { session }
            );
            
            await session.commitTransaction();
            return review[0];
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getReviewsByProductId(
        productId: string, 
        options: ReviewQueryOptions = {}
    ): Promise<PaginatedReviewResult> {
        const { page = 1, limit = 10, rating = null } = options;
        
        const query: any = { productId };
        if (rating !== null) {
            query.rating = parseInt(rating.toString());
        }
        
        const reviews = await Review.find(query)
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
            
        const total = await Review.countDocuments(query);
        
        return {
            reviews,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        };
    }
    
    async deleteReview(reviewId: string): Promise<{ success: boolean }> {
        const session: ClientSession = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // Get review before deletion to know the rating and productId
            const review = await Review.findById(reviewId);
            if (!review) {
                throw new Error('Review not found');
            }
            
            const productId = review.productId;
            const rating = review.rating;
            
            // Delete the review
            await Review.findByIdAndDelete(reviewId, { session });
            
            // Update product's rating counts
            await Product.findByIdAndUpdate(
                productId,
                {
                    $inc: {
                        [`ratingCounts.${rating}`]: -1,
                        reviewCount: -1
                    }
                },
                { session }
            );
            
            // Recalculate average rating
            const remainingReviews = await Review.find({ productId });
            
            if (remainingReviews.length === 0) {
                await Product.findByIdAndUpdate(
                    productId,
                    { rating: 0 },
                    { session }
                );
            } else {
                const totalRating = remainingReviews.reduce((sum, rev) => sum + rev.rating, 0);
                const newAvgRating = totalRating / remainingReviews.length;
                
                await Product.findByIdAndUpdate(
                    productId,
                    { rating: newAvgRating },
                    { session }
                );
            }
            
            await session.commitTransaction();
            return { success: true };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // Phương thức kiểm tra người dùng đã đánh giá sản phẩm chưa
    async hasUserReviewedProduct(userId: string, productId: string): Promise<boolean> {
        try {
            const review = await Review.findOne({ userId, productId });
            return review ? true : false;
        } catch (error: any) {
            throw new Error(`Error checking user review: ${error.message}`);
        }
    }
}

export default new ReviewController();
