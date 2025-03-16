import express, { Request, Response } from "express";
import { Logger } from "../utils/logger";
import CartController from "../controllers/cart.controller";

const CartRouter = express.Router();

// Lấy giỏ hàng của người dùng theo userId (được truyền qua req.params)
CartRouter.get("/:userId", (req: Request, res: Response) => {
  CartController.getCart(req, res);
  Logger.warn(`Get cart for user: ${req.params.userId}`);
});

// Thêm sản phẩm vào giỏ hàng
// Yêu cầu body: { userId, productId, quantity }
CartRouter.post("/add", (req: Request, res: Response) => {
  CartController.addItem(req, res);
  Logger.warn("Add item to cart");
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
// Yêu cầu body: { userId, productId, quantity }
CartRouter.put("/update", (req: Request, res: Response) => {
  CartController.updateItem(req, res);
  Logger.warn("Update item in cart");
});

// Xóa một sản phẩm khỏi giỏ hàng
// Yêu cầu body: { userId, productId }
CartRouter.post("/remove", (req: Request, res: Response) => {
  CartController.removeItem(req, res);
  Logger.warn("Remove item from cart");
});

// Xóa toàn bộ giỏ hàng của người dùng
// Yêu cầu body: { userId }
CartRouter.post("/clear", (req: Request, res: Response) => {
  CartController.clearCart(req, res);
  Logger.warn("Clear cart for user");
});

export default CartRouter;
