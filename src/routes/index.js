// const express = require('express')
// const app = express()
import { Router } from "express";
import memDBRouter from "./memberDatabase.js"
import createEventRouter from "./createEventRouter.js";
import editEventRouter from "./editEventRouter.js";
import Event from "../models/eventsModel.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

const router = Router();

function truncate(str) {
    return str.length >  150
    ? str.slice (0, 150) + "..."
    : str;
}

router.get('/', async (req, res) => {
    try {
        const nowManila = dayjs().tz('Asia/Manila');
        const nowUTC = nowManila.utc().toDate();

        const upcomingEvents = await Event.find({
            startDateTime: { $gte: nowUTC },
            // status: { $ne: 'cancelled' }
        }).sort({ startDateTime: 1 });

        const formattedEvents = upcomingEvents.map(event => {
            const eventObj = event.toObject();

            return {
                ...eventObj,
                // Add formatted Manila times
                displayDate: dayjs(event.startDateTime).tz('Asia/Manila').format('MMMM DD, YYYY'),
                displayStartTime: dayjs(event.startDateTime).tz('Asia/Manila').format('HH:mmA'),
                displayEndTime: dayjs(event.endDateTime).tz('Asia/Manila').format('HH:mmA'),
                displayDateTime: dayjs(event.startDateTime).tz('Asia/Manila').format('MMMM DD, YYYY [at] h:mm A'),
                eventDescription: truncate(event.eventDescription),
            };
        }); 

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
        res.render('adminHomePage', {
            title: "Admin Home Page",
            upcoming: formattedEvents
        })
    } catch (error) {
        console.error(error);
    }
});


router.use(memDBRouter);
router.use(createEventRouter);
router.use(editEventRouter);
router.use(calenderRouter);

export default router;
