import mongoose from "mongoose";
const { Schema, model } = mongoose

const eventSchema = new Schema({
    eventName: {type: String, required: true, trim: true},
    dateHeld: {type: Date},
});

const Events = model('events', eventSchema);
export default Events;
