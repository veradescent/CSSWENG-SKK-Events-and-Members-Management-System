const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {type: String, required: true, trim: true},
  areaChurch: {type: String, required: true, trim: true},
  age: {type: Number,min: 0},

  sim: {type: String, enum: ['Kids', 'Youth', 'Young Adults', 'Adults', 'Seniors'], //restrict to known SIMs (optional) 
    required: true},

  emailAddress: {type: String, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],}, // xxx@xxx.xxx
  contactNumber: {type: String, trim: true, match: [/^(\+63|0)\d{10}$/, 'Invalid contact number']}, // +63.... or 09...

  dateAdded: {type: Date, default: Date.now}
}, { versionKey: false });

const memberModel = mongoose.model('member', memberSchema);
module.exports = memberModel;
