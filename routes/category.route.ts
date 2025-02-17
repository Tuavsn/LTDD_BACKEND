import express, { Request, Response } from "express";
import { Logger } from "../utils/logger";
import CategoryController from "../controllers/category.controller";

const CategoryRouter = express.Router();

CategoryRouter.get("/", (req: Request, res: Response) => {
    CategoryController.getAll(req, res);
    Logger.warn("Get all categories");
})

CategoryRouter.get("/:id", (req: Request, res: Response) => {
    CategoryController.getById(req, res);
    Logger.warn(`Get category with id: ${req.params.id}`);
})

CategoryRouter.post("/", (req: Request, res: Response) => {
    CategoryController.create(req, res);
    Logger.warn("Create category");
})

CategoryRouter.put("/:id", (req: Request, res: Response) => {
    CategoryController.update(req, res);
    Logger.warn(`Update category with id: ${req.params.id}`);
})

CategoryRouter.delete("/:id", (req: Request, res: Response) => {
    CategoryController.delete(req, res);
    Logger.warn(`Delete category with id: ${req.params.id}`);
})

export default CategoryRouter;