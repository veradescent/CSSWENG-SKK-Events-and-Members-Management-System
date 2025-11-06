import ErrorLog from './src/models/errorLog.js';

async function logError(error, req) {
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

export default logError;
// put the line below inside "try" to manually test the function logError
//throw new Error('Test error for logging');
