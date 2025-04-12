import { Request, Response } from "express";
import { Logger } from "../utils/logger";
import Order, { OrderState } from "../models/order.model";
import { TokenPayload } from "./auth.controller";

class OrderController {
  async getOrders(req: Request, res: Response) {
    try {
      const userId = (req.user as TokenPayload).id;
      const orders = await Order.find({ user: userId }).populate("items");
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

  async cancelOrder(req: Request, res: Response) {
    try {
      const orderId = req.params.id;
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.state === OrderState.CANCELED) {
        return res.status(400).json({ message: "Order already cancelled" });
      }
      if (order.state === OrderState.DELIVERED) {
        return res.status(400).json({ message: "Cannot cancel completed order" });
      }
      if (order.state === OrderState.DELIVERING) {
        // return res.status(400).json({ message: "Cannot cancel order in delivery" });
        return res.status(201).json({ message: "Order is being delivered, cancellation request sent" });
      }

      order.state = OrderState.CANCELED;
      await order.save();
      res.status(200).json({ message: "Order cancelled successfully" });
    } catch (error: any) {
      Logger.error(`Error in cancelOrder: ${error}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new OrderController();