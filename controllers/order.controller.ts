import { Request, Response } from "express";
import { Logger } from "../utils/logger";
import Order from "../models/order.model";
import { TokenPayload } from "./auth.controller";

class OrderController {
  async getOrders(req: Request, res: Response) {
    try {
      const userId = (req.user as TokenPayload).id;
      const orders = await Order.find({ user: userId });
      res.status(200).json({ orders });
    } catch (error: any) {
      Logger.error(`Error in getOrders: ${error}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await Order.find();
      res.status(200).json({ orders });
    } catch (error: any) {
      Logger.error(`Error in getAllOrders: ${error}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new OrderController();