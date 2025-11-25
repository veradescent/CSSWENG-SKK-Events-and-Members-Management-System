import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  areaChurch: { type: String, required: true },
  sim: { type: String, required: true },
  contactNumber: { type: String },
  emailAddress: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now },
});

const Member = mongoose.model('Member', memberSchema);

export default Member;
