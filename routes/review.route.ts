import express, { Request, Response } from "express";
import { Logger } from "../utils/logger";
import ReviewController from "../controllers/review.controller";

const ReviewRouter = express.Router();

// Get reviews for a product with pagination and filtering
ReviewRouter.get("/product/:productId", (req: Request, res: Response) => {
    ReviewController.getReviewsByProductId(
        req.params.productId,
        {
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
            rating: req.query.rating ? parseInt(req.query.rating as string) : null
        }
    )
        .then(reviews => res.status(200).json(reviews))
        .catch(error => res.status(500).json({ message: error.message }));
    
    Logger.warn(`Get reviews for product: ${req.params.productId}`);
});

// Check if a user has reviewed a product
ReviewRouter.get("/check", (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    const productId = req.query.productId as string;

    ReviewController.hasUserReviewedProduct(userId, productId)
        .then(hasReviewed => res.status(200).json({ hasReviewed }))
        .catch(error => res.status(500).json({ message: error.message }));
    
    Logger.warn(`Check review for product: ${productId} by user: ${userId}`);
});

// Create a new review
ReviewRouter.post("/", (req: Request, res: Response) => {
    const reviewData = {
        userId: req.body.userId,
        productId: req.body.productId,
        rating: req.body.rating,
        comment: req.body.comment,
        images: req.body.images
    };

    ReviewController.createReview(reviewData)
        .then(review => res.status(201).json(review))
        .catch(error => res.status(500).json({ message: error.message }));
    
    Logger.warn(`Create review for product: ${req.body.productId}`);
});

// Delete a review
ReviewRouter.delete("/:reviewId", (req: Request, res: Response) => {
    ReviewController.deleteReview(req.params.reviewId)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ message: error.message }));
    
    Logger.warn(`Delete review with id: ${req.params.reviewId}`);
});

export default ReviewRouter;
