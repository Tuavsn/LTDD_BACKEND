import { Request, Response } from "express";
import { Logger } from "../utils/logger";
import Discount from "../models/discount.model";
import crudController from "./common.controller";

class DiscountController extends crudController {
  
  constructor() {
    super(Discount);
  }

  getDiscountByCode = async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      const discount = await Discount.findOne({ code: code.toUpperCase() });
      if (!discount) {
        return res.status(404).json({ message: "Discount not found" });
      }
      return res.status(200).json(discount);
    }
    catch (error) {
      Logger.error("Error fetching discount:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default new DiscountController();