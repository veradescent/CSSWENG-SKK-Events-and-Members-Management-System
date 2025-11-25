// src/queue/queue.js
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
};
if (process.env.REDIS_PASSWORD) redisOptions.password = process.env.REDIS_PASSWORD;

export const connection = new IORedis(redisOptions);

export const emailQueue = new Queue('emailQueue', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
