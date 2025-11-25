// const express = require('express')
// const app = express()
import { Router } from 'express';
import memDBRouter from './memberDatabase.js';
import createEventRouter from './createEventRouter.js';
import editEventRouter from './editEventRouter.js';
import authenticationRouter from './authenticationRouter.js';
import Event from '../models/eventsModel.js';
import calenderRouter from './calendarRouter.js';
import dayjs from 'dayjs';
import logError from '../../logError.js';
import eventsApiRouter from './api/eventsApiRouter.js';
import participationApiRouter from './api/participationApiRouter.js';
import uploadRouter from './api/uploadRouter.js';
import reportsRouter from './reportsRouter.js';

const router = Router();

function truncate(str) {
  return str.length > 150 ? str.slice(0, 150) + '...' : str;
}

router.get('/', async (req, res) => {
  try {
    const nowManila = dayjs().tz('Asia/Manila');
    const nowUTC = nowManila.utc().toDate();

    const upcomingEvents = await Event.find({
      startDateTime: { $gte: nowUTC },
      // status: { $ne: 'cancelled' }
    }).sort({ startDateTime: 1 });
    // console.log("RAW EVENTS FROM DB (first 3):", upcomingEvents.slice(0,3).map(e => ({
    // _id: e._id,
    // eventName: e.eventName,
    // image: e.image
    // })));
    const formattedEvents = upcomingEvents.map((event) => {
      const eventObj = event.toObject();

      return {
        ...eventObj,
        // Add formatted Manila times
        displayDate: dayjs(event.startDateTime).tz('Asia/Manila').format('MMMM DD, YYYY'),
        displayStartTime: dayjs(event.startDateTime).tz('Asia/Manila').format('HH:mmA'),
        displayEndTime: dayjs(event.endDateTime).tz('Asia/Manila').format('HH:mmA'),
        displayDateTime: dayjs(event.startDateTime)
          .tz('Asia/Manila')
          .format('MMMM DD, YYYY [at] h:mm A'),
        eventDescription: truncate(event.eventDescription),
      };
    });

    res.render('adminHomePage', {
      title: 'Home Page',
      upcoming: formattedEvents,
    });
  } catch (error) {
    console.error(error);
    await logError(error, req);
  }
});

router.use(memDBRouter);
router.use(createEventRouter);
router.use(editEventRouter);
router.use(calenderRouter);
router.use(authenticationRouter);
router.use('/api', eventsApiRouter);
router.use('/api', participationApiRouter);
router.use('/api', uploadRouter);
router.use('/', reportsRouter);
export default router;
