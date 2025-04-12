import client from "../configs/redis";
import Order, { OrderState } from "../models/order.model";
import { Logger } from "../utils/logger";
import { backgroundWorker } from "./backgroundWorker";

const QUEUE_KEY = 'auto-approve-order-queue';

const initQueue = async () => {
  const existedQueue = await client.get(QUEUE_KEY);
  if (!existedQueue) {
    client.set(QUEUE_KEY, JSON.stringify([]));
    Logger.info('Created new queue');
  }
}

async function getOrder(orderId: string) {
  try {
    const ttl = await client.ttl(orderId);
    const order = await client.get(orderId);

    if (!order) {
      return null;
    }

    return { order, ttl };
  } catch (e) {
    return null;
  }
}

async function getOrderIds() {
  return JSON.parse(await client.get(QUEUE_KEY) ?? "[]") as string[];
}

async function setOrderIds(orderIds: string[]) {
  client.set(QUEUE_KEY, JSON.stringify(orderIds));
}

async function checkAndApproveOrder() {
  let orderIds = await getOrderIds();
  Logger.info(`Checking and approving ${orderIds.length} orders`);

  for (const orderId of orderIds) {
    const order = await getOrder(orderId);

    if (!order) {
      Logger.info(`Order ${orderId} not found in Redis`);
      orderIds = orderIds.filter((id) => id !== orderId);
      continue;
    }

    const orderModel = await Order.findById(orderId);

    if (!orderModel) {
      await client.del(orderId);
      Logger.info(`Order ${orderId} not found in database`);
      orderIds = orderIds.filter((id) => id !== orderId);
      continue;
    }

    if (orderModel.state === OrderState.CANCELED) {
      Logger.info(`Order ${orderId} is canceled`);
      await client.del(orderId);
      orderIds = orderIds.filter((id) => id !== orderId);
      continue;
    }

    if (order.ttl > 0 && order.ttl <= 60 * 2) {
      await approveOrder(orderId);
    }
  }

  await client.set(QUEUE_KEY, JSON.stringify(orderIds));
  Logger.info(`Updated order IDs in queue: ${orderIds}`);

  const orderIdsRemaining = JSON.parse(await client.get(QUEUE_KEY) ?? "[]");
  if (orderIdsRemaining.length === 0) {
    stopCheckAndApproveOrder();
  }
}

async function approveOrder(orderId: string) {
  Logger.info(`Approving order ${orderId}`);
  const approvedOrder = await Order.findOneAndUpdate({ _id: orderId }, { $set: { state: OrderState.ACCEPTED } }, { new: true });
  client.del(orderId);
  setOrderIds((await getOrderIds()).filter((id: string) => id !== orderId));
}

async function addOrder(order: any) {
  setOrderIds([...(await getOrderIds()), order.id]);
  client.set(order._id, JSON.stringify(order), 'EX', 60 * 3);
  startCheckAndApproveOrder();
}

function startCheckAndApproveOrder() {
  initQueue();
  if (!backgroundWorker.runEachMinute.includes(checkAndApproveOrder)) {
    backgroundWorker.runEachMinute.push(checkAndApproveOrder);
    Logger.info('Starting check and approve order');
  }
}

function stopCheckAndApproveOrder() {
  Logger.info('Stopping check and approve order');
  backgroundWorker.runEachMinute = backgroundWorker.runEachMinute.filter((task) => task !== checkAndApproveOrder);
}

async function resetQueue() {
  await client.del(QUEUE_KEY);
}

export {
  addOrder,
  startCheckAndApproveOrder,
  stopCheckAndApproveOrder,
  resetQueue
}