import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema(
  {
    message: String,
    stack: String,
    route: String,
    method: String,
  },
  { timestamps: true }
);

const ErrorLog = mongoose.models.ErrorLog || mongoose.model('ErrorLog', errorLogSchema);

export default ErrorLog;
