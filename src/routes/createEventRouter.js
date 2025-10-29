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
        const now = dayjs();
        const tz = "Asia/Manila";
        const utc8 = now.tz(tz, true);
        console.log(`utc8: ${utc8}`);
        console.log(`now: ${now}`);
        const currentDate = dayjs().tz(tz).startOf('day').toDate();
        console.log(`currentDate: ${currentDate}`);
        const upcomingEvents = await Event.find(
            {dateHeld: {$gte: currentDate} } // verify this based on how the timestamp will be stored
        );
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
    console.log("/addEvent request received");
    const newEvent = new Event({
        eventName: req.body.title,
        eventDescription: req.body.description,
        dateHeld: req.body.date,
        timeFrom: req.body.timeFrom,
        timeTo: req.body.timeTo,
        type: req.body.type
    });

    newEvent.save();
})

export default createEventRouter;
