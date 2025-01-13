import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import apiRouter from './routes/api.route';
import { connectDB } from './configs/db';
import { Logger } from './utils/logger';

const app: Express = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/', apiRouter);


app.get('/', (req: Request, res: Response) => {
  res.json({ status: '>>> API is running'});
})


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  Logger.warn(`Server running on port: ${PORT}`);
})