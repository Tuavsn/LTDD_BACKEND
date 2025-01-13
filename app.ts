import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import apiRouter from './routes/api.route';
import { connectDB } from './configs/db';
import { Logger } from './utils/logger';

const app: Express = express();

connectDB();

app.use(cors({
  origin: '0.0.0.0',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1', apiRouter);

const middle = (req: Request, res: Response, next: any) => {
  console.log('Middleware:', req.url);
  next();
}

app.use(middle);


app.get('/', (req: Request, res: Response) => {
  res.json({ status: '>>> API is running' });
})


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  Logger.warn(`Server running on port: ${PORT}`);
})