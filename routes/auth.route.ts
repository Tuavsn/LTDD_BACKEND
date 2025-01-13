import express, { Request, Response } from 'express';
import AuthController from '../controllers/auth.controller';

const authRouter = express.Router();

authRouter.post('/register', (req: Request, res: Response) => {
    AuthController.register(req, res);
});

authRouter.post('/forgot-password', (req: Request, res: Response) => {
    AuthController.forgotPassword(req, res);
});

authRouter.post('/verify-otp', (req: Request, res: Response) => {
    AuthController.verifyOtp(req, res);
});

authRouter.post('/resend-otp', (req: Request, res: Response) => {
    AuthController.forgotPassword(req, res);
});

export default authRouter;
