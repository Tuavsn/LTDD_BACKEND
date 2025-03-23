import { Request, Response } from "express";
import Cart from "../models/cart.model";
import { Logger } from "../utils/logger";
import Order from "../models/order.model";
import User from "../models/user.model";
import { TokenPayload } from "./auth.controller";
import { addOrder } from "../worker/autoApproveOrderQueue";

class CartController {

  /**
   * thanh toán giỏ hàng
   * @route {POST} /api/v1/cart/checkout
   * @body { userId, address, phone, note }
   * @return cart
   * @return order
   */
  async checkout(req: Request, res: Response) {
    try {
      const { address, phone, note, paymentMethod } = req.body;
      const userId = (req.user as TokenPayload).id;
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      // Tạo đơn hàng mới từ giỏ hàng
      const order = new Order({
        user: userId,
        items: cart.items,
        items_count: cart.items_count,
        address,
        phone,
        note,
        paymentMethod,
      });
      await order.save();
      // Thêm đơn hàng vào danh sách hàng đợi tự động duyệt đơn hàng
      await addOrder(order);

      // Xóa giỏ hàng sau khi đã thanh toán
      cart.items = [];
      cart.items_count = [];
      await cart.save();

      // Lưu địa chỉ mới vào danh sách địa chỉ của người dùng nếu chưa có trong danh sách
      const user = await User.findById(userId);
      if (user && !user.address.includes(address)) {
        user.address.forEach((a) => (a.isPrimary = false));
        user.address.push({ address, isPrimary: true });
        await user.save();
      }

      res.status(200).json({ cart });
    } catch (error: any) {
      Logger.error(`Error in checkout: ${error}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * Lấy giỏ hàng của người dùng dựa trên userId (truyền qua req.params)
   * @route {GET} /api/v1/cart/:userId
   */
  async getCart(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const cart = await Cart.findOne({ user: userId })
        .populate("items")
        .lean();
      if (!cart) {
        const cart = new Cart({ user: userId, items: [], items_count: [] });
        await cart.save();
        return res.status(200).json(cart);
      }
      // Ghép mảng items và items_count thành một mảng chứa đối tượng { product, quantity }
      const combinedItems = cart.items.map((item: any, index: number) => ({
        product: item,
        quantity: cart.items_count[index] || 0,
      }));
      res.status(200).json({ ...cart, items: combinedItems });
    } catch (error: any) {
      Logger.error(`Error in getCart: ${error}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * Thêm sản phẩm vào giỏ hàng.
   * Yêu cầu trong req.body: { userId, productId, quantity }
   * @route {POST} /api/v1/cart/add
   */
  async addItem(req: Request, res: Response) {
    try {
      const { userId, productId, quantity } = req.body;
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        // Tạo giỏ hàng mới nếu chưa tồn tại
        cart = new Cart({ user: userId, items: [], items_count: [] });
      }
      // Tìm index của sản phẩm trong mảng items
      const index = cart.items.findIndex((item: any) => item.toString() === productId);
      if (index >= 0) {
        // Nếu sản phẩm đã tồn tại, cập nhật số lượng
        cart.items_count[index] += quantity;
      } else {
        // Nếu chưa tồn tại, thêm mới sản phẩm và số lượng tương ứng
        cart.items.push(productId);
        cart.items_count.push(quantity);
      }
      await cart.save();
      res.status(200).json(cart);
    } catch (error: any) {
      Logger.error(`Error in addItem: ${error}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * Cập nhật số lượng của một sản phẩm trong giỏ hàng.
   * Yêu cầu trong req.body: { userId, productId, quantity }
   * @route {PUT} /api/v1/cart/update
   */
  async updateItem(req: Request, res: Response) {
    try {
      const { userId, productId, quantity } = req.body;
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      const index = cart.items.findIndex((item: any) => item.toString() === productId);
      if (index < 0) {
        return res.status(404).json({ message: "Product not found in cart" });
      }
      cart.items_count[index] = quantity;
      await cart.save();
      res.status(200).json(cart);
    } catch (error: any) {
      Logger.error(`Error in updateItem: ${error}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * Xóa một sản phẩm khỏi giỏ hàng.
   * Yêu cầu trong req.body: { userId, productId }
   * @route {DELETE} /api/v1/cart/remove
   */
  async removeItem(req: Request, res: Response) {
    try {
      const { userId, productId } = req.body;
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      const index = cart.items.findIndex((item: any) => item.toString() === productId);
      if (index < 0) {
        return res.status(404).json({ message: "Product not found in cart" });
      }
      // Xóa sản phẩm và số lượng tương ứng từ các mảng
      cart.items.splice(index, 1);
      cart.items_count.splice(index, 1);
      await cart.save();
      res.status(200).json(cart);
    } catch (error: any) {
      Logger.error(`Error in removeItem: ${error}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * Xóa toàn bộ sản phẩm khỏi giỏ hàng của người dùng.
   * Yêu cầu trong req.body: { userId }
   * @route {DELETE} /api/v1/cart/clear
   */
  async clearCart(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      cart.items = [];
      cart.items_count = [];
      await cart.save();
      res.status(200).json(cart);
    } catch (error: any) {
      Logger.error(`Error in clearCart: ${error}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new CartController();
