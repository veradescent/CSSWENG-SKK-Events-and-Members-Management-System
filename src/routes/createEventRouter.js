import { Router } from "express";
import Participation from "../models/participationModel.js";
import Event from "../models/eventsModel.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";


const createEventRouter = Router();
dayjs.extend(utc);
dayjs.extend(timezone);

createEventRouter.get('/createEvent', async (req, res) => {
    try {
        // const now = dayjs();
        // const tz = "Asia/Manila";
        // const utc8 = now.tz(tz, true);
        // console.log(`utc8: ${utc8}`);
        // console.log(`now: ${now}`);
        // const currentDate = dayjs().tz(tz).startOf('day').toDate();
        // console.log(`currentDate: ${currentDate}`);
        // const upcomingEvents = await Event.find(
        //     {dateHeld: {$gte: currentDate} } // verify this based on how the timestamp will be stored
        // );
        res.render('createEvent', {
            title: "Create Event",
        })
    } catch (error) {
        console.error(error);
    }
})

createEventRouter.post('/addEvent', async (req, res) => {

    // const eventData = {
    //     title: document.getElementById("eventTitle").value,
    //     description: document.getElementById("eventDescription").value,
    //     attendees: document.getElementById("eventAttendees").value,
    //     type: document.getElementById("eventType").value,
    //     date: document.getElementById("eventDate").value,
    //     timeFrom: document.getElementById("eventTimeFrom").value,
    //     timeTo: document.getElementById("eventTimeTo").value,
    //     sendAll: sendAllCheckbox.checked,
    //     customMembers: customCheckbox.checked ? getSelectedMembers() : [],
    //     image: uploadedImage
    // };

    // TODO: add attendees handling by linking the attendees' ids in participationModel and event id
    // time data received from user is in UTC+8
    const { title, description, attendees, type, date, timeFrom, timeTo, sendAll, customMembers } = req.body;

    // Combine date and time, treating them as Manila time
    const manilaStartTime = `${date}T${timeFrom}:00`;  // "2025-10-30T09:00:00"
    const manilaEndTime = `${date}T${timeTo}:00`;      // "2025-10-30T17:00:00"

    // Convert Manila time to UTC
    const startDateTimeUTC = dayjs.tz(manilaStartTime, 'Asia/Manila').utc().toDate();
    const endDateTimeUTC = dayjs.tz(manilaEndTime, 'Asia/Manila').utc().toDate();
    console.log("/addEvent request received");

    console.log('Manila Start:', manilaStartTime);
    console.log('UTC Start:', startDateTimeUTC);
    console.log('Manila End:', manilaEndTime);
    console.log('UTC End:', endDateTimeUTC);

    const newEvent = new Event({
        eventName: title,
        eventDescription: description,
        startDateTime: startDateTimeUTC,
        endDateTime: endDateTimeUTC,
        type: req.body.type
    });

    try {
        await newEvent.save();
        // console.log("Event successfully created");
        return res.status(201).json({
            message: 'Event successfully created'
        });
    } catch (error) {
        console.log(`Error from model: ${error}`);
        return res.status(500).json({
            status: false,
            message: 'Event was not created'
        });
    }
})

export default createEventRouter;
