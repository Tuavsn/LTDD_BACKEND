import { model, Schema, Document, Types } from "mongoose";

// Define the interface for Review document
export interface IReview extends Document {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  rating: number;
  comment: string;
  images?: Array<{ url: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required"]
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, "Product ID is required"]
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating must be at most 5"]
    },
    comment: {
        type: String,
        required: [true, "Comment is required"]
    },
    images: [{
        url: { type: String, required: true },
    }],
}, { timestamps: true });

const Review = model<IReview>("Review", reviewSchema);

export default Review;