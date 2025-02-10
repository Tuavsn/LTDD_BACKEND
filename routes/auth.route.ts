import express, { Request, Response } from 'express';
import AuthController from '../controllers/auth.controller';

const authRouter = express.Router();

authRouter.post('/login', (req: Request, res: Response) => {
    AuthController.login(req, res);
});

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
    AuthController.resendOtp(req, res);
});

authRouter.post('/reset-password', (req: Request, res: Response) => {
    AuthController.resetPassword(req, res);
});

export default authRouter;
