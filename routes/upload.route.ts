// router.ts
import express, { Request, Response } from 'express';
import { UploadController } from '../controllers';
const router = express.Router();

// router.use('/image', express.raw({ type: 'application/octet-stream', limit: '50mb' }));

router.post('/image', (req: Request, res: Response) => {
  UploadController.uploadImage(req, res);
});
export default router;