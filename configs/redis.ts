import Redis from "ioredis";

const client = new Redis({
  host: process.env.REDIS_HOST || "example.com",
  port: parseInt(process.env.REDIS_PORT ?? "") || 18916,
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || "default",
});

client.on("connect", () => {
  console.log("Connected to Redis");
});

client.on("error", (error) => {
  console.error("Error connecting to Redis", error);
});

export default client;


