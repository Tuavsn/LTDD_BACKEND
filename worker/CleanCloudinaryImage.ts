import cron from 'node-cron';

class CleanCloudinaryImageWorker {
  start() {


    // Chạy hàng ngày lúc 00:00
    cron.schedule('*/5 * * * *', () => {
      console.log(`[${new Date().toISOString()}] Running cleanup task...`);
      this.cleanImage();
    });
  }

  cleanImage() {
    console.log('Starting cleaning image');

    setTimeout(() => {
      console.log('Cleaning image done');
    }, 5000);
  }
}

export const cleanCloudinaryImageWorker = new CleanCloudinaryImageWorker();
