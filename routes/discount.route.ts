// router.ts
import express, { Request, Response } from 'express';
import { DiscountController } from '../controllers';
import { Logger } from '../utils/logger';
const router = express.Router();

// router.use('/image', express.raw({ type: 'application/octet-stream', limit: '50mb' }));

router.post('/check', async (req: Request, res: Response) => {
  DiscountController.getDiscountByCode(req, res);
  Logger.info(`POST /discount/check, body: ${req.body}`);
})

export default router;