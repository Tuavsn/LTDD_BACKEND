import express, { Request, Response } from 'express';
import AuthController from '../controllers/auth.controller';

const AuthRouter = express.Router();

AuthRouter.post('/login', (req: Request, res: Response) => {
    AuthController.login(req, res);
});

AuthRouter.post('/register', (req: Request, res: Response) => {
    AuthController.register(req, res);
});

AuthRouter.post('/forgot-password', (req: Request, res: Response) => {
    AuthController.forgotPassword(req, res);
});

AuthRouter.post('/verify-otp', (req: Request, res: Response) => {
    AuthController.verifyOtp(req, res);
});

AuthRouter.post('/resend-otp', (req: Request, res: Response) => {
    AuthController.resendOtp(req, res);
});

AuthRouter.post('/reset-password', (req: Request, res: Response) => {
    AuthController.resetPassword(req, res);
});

export default AuthRouter;
