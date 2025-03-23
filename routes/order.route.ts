// router.ts
import express, { Request, Response } from 'express';
import { OrderController } from '../controllers';
const router = express.Router();

// router.use('/image', express.raw({ type: 'application/octet-stream', limit: '50mb' }));

export default router;