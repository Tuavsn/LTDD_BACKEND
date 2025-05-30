import express, { Request, Response } from "express";
import { Logger } from "../utils/logger";
import ProductController from "../controllers/product.controller";

const ProductRouter = express.Router();

ProductRouter.get("/", (req: Request, res: Response) => {
    ProductController.getAll(req, res);
    Logger.warn("Get all product");
})

ProductRouter.get("/search", (req: Request, res: Response) => {
    ProductController.search(req, res);
    Logger.warn("Search product");
});

ProductRouter.get("/best-seller", (req: Request, res: Response) => {
    ProductController.getBestSeller(req, res);
    Logger.warn("Get top 10 best seller product");
})

ProductRouter.get("/:id", (req: Request, res: Response) => {
    ProductController.getById(req, res);
    Logger.warn(`Get product with id: ${req.params.id}`);
})

ProductRouter.post("/", (req: Request, res: Response) => {
    ProductController.create(req, res);
    Logger.warn("Create product");
})

ProductRouter.put("/:id", (req: Request, res: Response) => {
    ProductController.update(req, res);
    Logger.warn(`Update product with id: ${req.params.id}`);
})

ProductRouter.delete("/:id", (req: Request, res: Response) => {
    ProductController.delete(req, res);
    Logger.warn(`Delete product with id: ${req.params.id}`);
})

ProductRouter.get("/:id/rating-stats", (req: Request, res: Response) => {
    ProductController.getRatingStats(req, res);
    Logger.warn(`Get rating stats for product with id: ${req.params.id}`);
});

ProductRouter.get("/:id/similar", (req: Request, res: Response) => {
    ProductController.getSimilarProducts(req, res);
    Logger.warn(`Get similar products for product with id: ${req.params.id}`);
});

export default ProductRouter;