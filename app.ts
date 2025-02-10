import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import apiRouter from './routes/api.route';
import { connectDB } from './configs/db';
import { Logger } from './utils/logger';
import { authenticationMiddleware } from './middlewares/authenciation.middlewares';

import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app: Express = express();

connectDB();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));
const middle = (req: Request, res: Response, next: any) => {
  console.log('Middleware:', req.method, req.url);
  console.log(req.headers);
  next();
}

app.use(middle);

app.use(authenticationMiddleware)
app.use('/api/v1', apiRouter);

// test();

app.get('/', (req: Request, res: Response) => {
  res.json({ status: '>>> API is running' });
})


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  Logger.warn(`Server running on port: ${PORT}`);
})