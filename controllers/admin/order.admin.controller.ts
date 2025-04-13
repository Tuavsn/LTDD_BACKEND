import { Request, Response } from "express";
import Order from "../../models/order.model";
import NotificationHandler from "../../sockets/notification";
import { Logger } from "../../utils/logger";

class AdminOrderController {
  constructor() { }

  async changeOrderStatus(req: Request, res: Response) {
    try {
      const orderId = req.params.id;
      const { state } = req.body;

      if (!state) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      order.state = state;
      await order.save();

      // Emit event to update order status in real-time
      NotificationHandler.onChangeOrderStatus(order.user.toString(), orderId, state);

      res.status(200).json({ message: "Order updated successfully" });
    } catch (error: any) {
      Logger.error(`Error in updateOrder: ${error}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new AdminOrderController();