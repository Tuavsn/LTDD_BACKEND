import express, { Request, Response } from 'express'
import userRouter from './user.route';
import authRouter from './auth.route';

const api = express.Router();

api.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Welcome to API'})
});

api.use('/users', userRouter).use('/auth', authRouter)

export default api;