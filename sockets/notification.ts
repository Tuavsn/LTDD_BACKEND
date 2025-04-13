import http from 'http';
import socketIo from 'socket.io';
import { Express } from 'express';
import client from '../configs/redis';

class NotificationHandler {
  private static instance: NotificationHandler;
  private readonly io: socketIo.Server;
  private readonly server: http.Server;

  // Constructor được khai báo là private để không thể khởi tạo trực tiếp từ bên ngoài lớp.
  private constructor(app: Express) {
    this.server = http.createServer(app);
    this.io = new socketIo.Server(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });
  }

  // Phương thức tĩnh để lấy instance của NotificationHandler.
  // Lần đầu tiên phải cung cấp Express app để khởi tạo.
  public static getInstance(app?: Express): NotificationHandler {
    if (!NotificationHandler.instance) {
      if (!app) {
        throw new Error("Express app must be provided for the initial instance creation.");
      }
      NotificationHandler.instance = new NotificationHandler(app);
    }
    return NotificationHandler.instance;
  }

  // Phương thức khởi tạo các sự kiện socket.
  public init(): void {
    this.io.on('connection', (socket) => {
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        client.get(socket.id).then((userId) => {
          if (userId) {
            client.del(userId); // Xóa userId khỏi Redis
          }
          client.del(socket.id); // Xóa socketId khỏi Redis
        });
      });
      socket.on('message', (message: string) => {
        console.log('Message from client:', message);
      });

      socket.on('registerUser', (data: any) => {
        const { userId, socketId } = data;
        client.get(userId).then((existingSocketId) => {
          if (existingSocketId) {
            client.del(existingSocketId); // Xóa socketId cũ nếu có
          }
        }).finally(() => {
          client.set(userId, socketId); // Lưu socketId vào Redis với thời gian sống 7 ngày
          console.log('User registered:', userId, socketId);
        });
      });
      socket.on('unregisterUser', (data: any) => {
        const { userId } = data;
        client.get(userId).then((socketId) => {
          if (socketId) {
            client.del(socketId); // Xóa socketId khỏi Redis
          }
          client.del(userId); // Xóa userId khỏi Redis
          console.log('User unregistered:', userId);
        });
      });
    });
    // this.io.on('registerUser', (data: any) => {
    //   const { userId, socketId } = data;
    //   client.set(userId, socketId);
    //   client.set(socketId, userId);
    //   console.log('User registered:', userId, socketId);
    // });
    // this.io.on('unregisterUser', (data: any) => {
    //   const { userId, socketId } = data;
    //   client.del(userId);
    //   client.del(socketId);
    //   console.log('User unregistered:', userId, socketId);
    // });
    this.getServer().listen(process.env.SOCKET_PORT, () => {
      console.log(`Socket server running on port: ${process.env.SOCKET_PORT}`);
    });
  }

  public static async onChangeOrderStatus(userId: string, orderId: string, status: string): Promise<void> {
    const socketId = await client.get(userId); // Lấy socketId từ Redis
    if (socketId) {
      NotificationHandler.instance.io.to(socketId).emit('orderStatusChanged', { orderId, status });
      console.log('Order status changed:', orderId, status);
    } else {
      console.log('Socket ID not found for user:', userId);
    }
  }

  public getServer(): http.Server {
    return this.server;
  }
}

export default NotificationHandler;
