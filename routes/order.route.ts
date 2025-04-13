// router.ts
import express, { Request, Response } from 'express';
import { OrderController, AdminOrderController } from '../controllers';
import Order from '../models/order.model';
import { Logger } from '../utils/logger';
const router = express.Router();

// router.use('/image', express.raw({ type: 'application/octet-stream', limit: '50mb' }));

router.get('/', async (req: Request, res: Response) => {
  OrderController.getOrders(req, res);
  Logger.info(`GET /order`);
}
);

router.post('/checkout', async (req: Request, res: Response) => {
  OrderController.createOrder(req, res);
  Logger.info(`POST /order`);
});

router.put('/cancel/:id', async (req: Request, res: Response) => {
  OrderController.cancelOrder(req, res);
  Logger.info(`PUT /order/cancel/${req.params.id}`);
});

router.put('/admin/change-status/:id', async (req: Request, res: Response) => {
  AdminOrderController.changeOrderStatus(req, res);
  Logger.info(`PUT /order/admin/change-status/${req.params.id}`);
});

export default router;