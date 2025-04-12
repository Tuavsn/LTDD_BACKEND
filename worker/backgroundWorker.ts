import cron from 'node-cron';
import { startCheckAndApproveOrder } from './autoApproveOrderQueue';

class BackgroundWorker {
  runEachMinute: Array<Function> = [];
  runEachFiveMinutes: Array<Function> = [];
  runEachThirtyMinutes: Array<Function> = [];

  start() {
    // Chạy mỗi 5 phút
    cron.schedule('*/5 * * * *', () => {
      this.runEachFiveMinutes.forEach((task) => {
        task();
      });
    });

    // Chạy mỗi 1 phút
    cron.schedule('*/1 * * * *', () => {
      this.runEachMinute.forEach((task) => {
        task();
      });
    });

    // Chạy mỗi 30 phút
    cron.schedule('*/30 * * * *', () => {
      this.runEachThirtyMinutes.forEach((task) => {
        task();
      });
    });
  }

  startInitialTasks() {
    startCheckAndApproveOrder();
  }
}

export const backgroundWorker = new BackgroundWorker();
