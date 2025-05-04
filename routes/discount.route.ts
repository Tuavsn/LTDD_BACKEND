import express, { Request, Response } from "express";
import { DiscountController } from "../controllers";
import { Logger } from "../utils/logger";

const DiscountRouter = express.Router();

// Check discount code
DiscountRouter.post(
  "/check",
  async (req: Request, res: Response) => {
    DiscountController.getDiscountByCode(req, res);
    Logger.info(`POST /discount/check, body: ${JSON.stringify(req.body)}`);
  }
);

// Get all discounts
DiscountRouter.get(
  "/",
  (req: Request, res: Response) => {
    DiscountController.getAll(req, res);
    Logger.warn("Get all discounts");
  }
);

// Get a discount by ID
DiscountRouter.get(
  "/:id",
  (req: Request, res: Response) => {
    DiscountController.getById(req, res);
    Logger.warn(`Get discount with id: ${req.params.id}`);
  }
);

// Create a new discount
DiscountRouter.post(
  "/",
  (req: Request, res: Response) => {
    DiscountController.create(req, res);
    Logger.warn("Create discount");
  }
);

// Update an existing discount
DiscountRouter.put(
  "/:id",
  (req: Request, res: Response) => {
    DiscountController.update(req, res);
    Logger.warn(`Update discount with id: ${req.params.id}`);
  }
);

// Delete a discount
DiscountRouter.delete(
  "/:id",
  (req: Request, res: Response) => {
    DiscountController.delete(req, res);
    Logger.warn(`Delete discount with id: ${req.params.id}`);
  }
);

export default DiscountRouter;