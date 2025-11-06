import { Router } from "express";
import Event from "../models/eventsModel.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import logError from '../../logError.js';

const editEventRouter = Router();
dayjs.extend(utc);
dayjs.extend(timezone);

editEventRouter.get('/editEvent', async (req, res) => {
    res.render('editEvent', {
        title: "Edit Event",
    })
})

editEventRouter.get('/editEvent/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id).lean();

        if (!event) {
            return res.status(404).send('Event not found');
        }

        const formDate = dayjs(event.startDateTime).tz('Asia/Manila').format('YYYY-MM-DD');
        const formStartTime = dayjs(event.startDateTime).tz('Asia/Manila').format('HH:mm');
        const formEndTime = dayjs(event.endDateTime).tz('Asia/Manila').format('HH:mm');

        return res.render('editEvent', {
            title: "Edit Event",
            event,
            formDate,
            formStartTime,
            formEndTime
        });
    } catch (err) {
        console.error('Error loading event for editing:', err);
        await logError(err, req);
        return res.status(500).send('Internal Server Error');
    }
});

editEventRouter.delete('/editEvent/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Event.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        return res.status(200).json({ success: true, message: 'Event deleted' });
    } catch (err) {
        console.error('Error deleting event:', err);
        await logError(err, req);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

editEventRouter.put('/editEvent/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, attendees, type, date, timeFrom, timeTo } = req.body;

        if (!date || !timeFrom || !timeTo) {
            return res.status(400).json({ success: false, message: 'Date, start time, and end time are required.' });
        }

        const manilaStart = `${date}T${timeFrom}:00`;
        const manilaEnd = `${date}T${timeTo}:00`;
        const startDateTimeUTC = dayjs.tz(manilaStart, 'Asia/Manila').utc().toDate();
        const endDateTimeUTC = dayjs.tz(manilaEnd, 'Asia/Manila').utc().toDate();

        const updated = await Event.findByIdAndUpdate(
            id,
            {
                eventName: title,
                eventDescription: description,
                type,
                startDateTime: startDateTimeUTC,
                endDateTime: endDateTimeUTC,
                expectedAttendees: Number(attendees) || 0
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        return res.status(200).json({ success: true, message: 'Event updated', event: updated });
    } catch (err) {
        console.error('Error updating event:', err);
        await logError(err, req);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

export default editEventRouter;