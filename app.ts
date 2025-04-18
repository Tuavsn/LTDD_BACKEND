import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import ApiRouter from './routes/api.route';
import { connectDB } from './configs/db';
import { Logger } from './utils/logger';
import { authenticationMiddleware } from './middlewares/authenciation.middlewares';

import { v2 as cloudinary } from 'cloudinary';
import { backgroundWorker } from './worker/backgroundWorker';
import initNotificationHandler from './sockets/notification';
import NotificationHandler from './sockets/notification';
// import { resetQueue } from './worker/autoApproveOrderQueue';

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
  next();
}

app.use(middle);

app.use(authenticationMiddleware)
app.use('/api/v1', ApiRouter);

// test();

app.get('/', (req: Request, res: Response) => {
  res.json({ status: '>>> API is running' });
})

backgroundWorker.start();
backgroundWorker.startInitialTasks();

const notificationSocketServer = NotificationHandler.getInstance(app);
notificationSocketServer.init();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  Logger.warn(`Server running on port: ${PORT}`);
})