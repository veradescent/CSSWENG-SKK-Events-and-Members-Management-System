// src/models/eventsModel.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const eventSchema = new Schema({
  image: {
    type: String,
    default: null,
  },
  eventName: {
    type: String,
    required: true,
    trim: true,
  },
  eventDescription: {
    type: String,
    default: '',
    trim: true,
  },
  // ADDED: location field (so create new events can include location)
  location: {
    type: String,
    default: '',
  },
  // type of event (required in your schema earlier; set to required if you want)
  type: {
    type: String,
    required: false, // made optional at schema level to be safe, but server code ensures value
    default: 'Other',
  },
  startDateTime: {
    type: Date,
    required: true,
  },
  endDateTime: {
    type: Date,
    required: true,
  },
  expectedAttendees: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  status: {
    type: String,
    enum: ['upcoming', 'previous', 'cancelled'],
    default: 'upcoming',
  },
  // any other fields your app used (keep them here to avoid removing original fields)
  createdAt: {
    type: Date,
    default: Date.now,
  },
  minutesLink: { type: String, default: '' },
});

// If the original model had extra indexes or methods, preserve them here.
// Example: eventSchema.index({ startDateTime: 1 });

export default model('Event', eventSchema);
