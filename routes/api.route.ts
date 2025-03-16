import express, { Request, Response } from 'express'
import userRouter from './user.route';
import authRouter from './auth.route';
import uploadRouter from './upload.route';
import UserRouter from './user.route';
import AuthRouter from './auth.route';
import ProductRouter from './product.route';
import CategoryRouter from './category.route';
import CartRouter from './cart.route';

const api = express.Router();

api.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Welcome to API' })
});

api.use('/auth', AuthRouter)
    .use('/upload', uploadRouter)
    .use('/user', UserRouter)
    .use('/product', ProductRouter)
    .use('/category', CategoryRouter)
    .use('/cart', CartRouter);

export default api;