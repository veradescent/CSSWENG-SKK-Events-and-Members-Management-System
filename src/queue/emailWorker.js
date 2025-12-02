// src/queue/emailWorker.js
import 'dotenv/config';
import { Worker, QueueScheduler } from 'bullmq';
import { connection } from './queue.js';
import nodemailer from 'nodemailer';

// optional: import your logError if you have one
import logError from '../../logError.js';

new QueueScheduler('emailQueue', { connection });

// transporter using Gmail SMTP (App Password)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Worker processes jobs named 'send-batch' (each job has: { subject, html, batch, meta })
const worker = new Worker(
  'emailQueue',
  async (job) => {
    const { subject, html, batch } = job.data;
    if (!Array.isArray(batch) || batch.length === 0) {
      return { ok: true, info: 'empty batch' };
    }

    // Use BCC so each recipient doesn't see others (simple)
    // Gmail per-message recipient limit: keep batch size <= 100
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'SKK Events'}" <${process.env.FROM_EMAIL}>`,
      bcc: batch.join(','),
      subject,
      html,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return { ok: true, info };
    } catch (err) {
      console.error('Email send failed', err);
      try {
        await logError(err);
      } catch {
        /* ignore */
      }
      throw err;
    }
  },
  {
    concurrency: Number(process.env.EMAIL_WORKER_CONCURRENCY || 1),
    limiter: {
      max: Number(process.env.EMAIL_RATE_LIMIT_MAX || 5),
      duration: Number(process.env.EMAIL_RATE_LIMIT_DURATION || 1000),
    },
    connection,
  }
);

worker.on('completed', (job) => {
  console.log('Email job completed', job.id);
});
worker.on('failed', (job, err) => {
  console.error('Email job failed', job.id, err && err.message);
});

// graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down email worker...');
  await worker.close();
  await connection.quit();
  process.exit(0);
});