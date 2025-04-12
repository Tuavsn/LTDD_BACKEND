import express, { Request, Response } from 'express'
import uploadRouter from './upload.route';
import UserRouter from './user.route';
import AuthRouter from './auth.route';
import ProductRouter from './product.route';
import CategoryRouter from './category.route';
import CartRouter from './cart.route';
import OrderRouter from './order.route';
import DiscountRouter from './discount.route';

const api = express.Router();

api.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Welcome to API' })
});

api.use('/auth', AuthRouter)
    .use('/upload', uploadRouter)
    .use('/user', UserRouter)
    .use('/product', ProductRouter)
    .use('/category', CategoryRouter)
    .use('/cart', CartRouter)
    .use('/order', OrderRouter)
    .use('/discount', DiscountRouter)

export const openRoutes = ["/auth/", "/category", "/product", "/discount"];

export default api;