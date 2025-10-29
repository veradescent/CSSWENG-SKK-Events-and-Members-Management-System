import mongoose from "mongoose";
const { Schema, model } = mongoose

const eventSchema = new Schema({
    eventName: {type: String, required: true, trim: true},
    eventDescription: {type: String},
    dateHeld: {type: Date, required: true},
    timeFrom: {type: Date, required: true},
    timeTo: {type: Date, required: true},
    type: {type: String, required: true}, // not sure if category is limited to these Meetin', 'Workshop', 'Social' 
});

const Event = model('Event', eventSchema);
export default Event;
