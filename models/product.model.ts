import { model, Schema } from "mongoose";

const productSchema = new Schema({
    discounts: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Discount' }],
        default: [],
    },
    name: {
        type: String,
        required: [true, "Product name is required"],
    },
    price: {
        type: Number,
        default: 0,
        min: [0, "Product price must be at least 0"],
    },
    quantity: {
        type: Number,
        default: 0,
        min: [0, "Product quantity must be at least 0"],
    },
    description: {
        type: String
    },
    image: [{
        url: { type: String },
        isPrimary: { type: Boolean, default: false }
    }],
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, "Category is required"]
    },
    rating: {
        type: Number,
        default: 0,
        set: (value: number) => Math.round(value * 10) / 10,
        min: [0, "Product rating must be at least 0"],
        max: [5, "Product rating must be at most 5"],
    },
    soldCount: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    ratingCounts: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 }
    }
}, { timestamps: true });

// Virtual for getting reviews
productSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'productId'
});

// Set virtuals to true in toJSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = model("Product", productSchema);

export default Product;