//import ErrorLog from './src/models/errorLogs.js';

export default async function logError(error, req, ErrorLogModel) {
  try {
    console.log("Logging error:", error.message);
    await ErrorLog.create({
      message: error.message,
      stack: error.stack,
      route: req.originalUrl,
      method: req.method
    });
  } catch (err) {
    console.error('Failed to log error:', err);
  }
}
