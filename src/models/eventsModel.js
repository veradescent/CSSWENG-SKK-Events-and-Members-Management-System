import mongoose from "mongoose";
const { Schema, model } = mongoose

const eventSchema = new Schema({
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    eventDescription: {type: String},
    startDateTime: {    // UTC
        type: Date,
        required: true
    },
    endDateTime: {      // UTC
        type: Date,
        required: true
    },
    type: {type: String, required: true},       // not sure if category is limited to these Meeting', 'Workshop', 'Social' 
});

const Event = model('Event', eventSchema);
export default Event;
