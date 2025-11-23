// logError.js
// Robust error logger. This accepts an optional ErrorLogModel for test overrides,
// but by default imports the ErrorLog model from the project.
import ErrorLog from './src/models/errorLogs.js';

export default async function logError(error, req, ErrorLogModel = null) {
  try {
    const Model = ErrorLogModel || ErrorLog;

    // Keep original console logging behavior
    console.error("Logging error:", error?.message || error);

    // Create an error log entry without throwing further if logging fails
    await Model.create({
      message: error?.message || String(error),
      stack: error?.stack || '',
      route: req?.originalUrl || '',
      method: req?.method || ''
    });
  } catch (err) {
    // Important: don't allow logging failure to crash the app
    console.error('Failed to log error:', err);
  }
}
