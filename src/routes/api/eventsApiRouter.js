// src/routes/api/eventsApiRouter.js
import { Router } from 'express';
import Event from '../../models/eventsModel.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import logError from '../../../logError.js';
import { requireAdmin } from '../../middleware/authMiddleware.js';
dayjs.extend(utc);
dayjs.extend(timezone);

const router = Router();

/**
 * GET /api/events
 * Query params: start (ISO date), end (ISO date)
 * Returns events that overlap that date span.
 *
 * Example: /api/events?start=2025-11-01&end=2025-11-30
 */
router.get('/events', async (req, res) => {
  try {
    const { start, end } = req.query;

    // If no range provided, default to current month (Manila)
    let startDateUTC, endDateUTC;
    if (start && end) {
      // treat provided dates as local (Asia/Manila) start-of-day / end-of-day
      startDateUTC = dayjs.tz(`${start}T00:00:00`, 'Asia/Manila').utc().toDate();
      endDateUTC = dayjs.tz(`${end}T23:59:59`, 'Asia/Manila').utc().toDate();
    } else {
      const now = dayjs().tz('Asia/Manila');
      startDateUTC = now.startOf('month').utc().toDate();
      endDateUTC = now.endOf('month').utc().toDate();
    }

    // Find events that intersect the requested range
    // (event.start <= end && event.end >= start)
    const events = await Event.find({
      $or: [{ startDateTime: { $lte: endDateUTC }, endDateTime: { $gte: startDateUTC } }],
    })
      .sort({ startDateTime: 1 })
      .lean()
      .exec();

    // Transform to client-friendly format: convert UTC -> Asia/Manila ISO strings
    const transformed = events.map((ev) => {
      const startManila = dayjs(ev.startDateTime).tz('Asia/Manila').format();
      const endManila = dayjs(ev.endDateTime).tz('Asia/Manila').format();
      return {
        id: ev._id,
        title: ev.eventName,
        description: ev.eventDescription || '',
        startUTC: ev.startDateTime,
        endUTC: ev.endDateTime,
        start: startManila,
        end: endManila,
        expectedAttendees: ev.expectedAttendees || 0,
        type: ev.type || 'General',
      };
    });

    return res.json({ success: true, events: transformed });
  } catch (err) {
    console.error('GET /api/events error', err);
    await logError(err, req);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * POST /api/events
 * Body: { title, description, date (YYYY-MM-DD), timeFrom (HH:mm), timeTo (HH:mm), type, expectedAttendees }
 * Creates an event (assumes Manila timezone input).
 */
router.post('/events', async (req, res) => {
  try {
    const { title, description, date, timeFrom, timeTo, type, expectedAttendees } = req.body;
    if (!title || !date || !timeFrom || !timeTo) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // build Manila local datetimes and convert to UTC for DB
    const manilaStart = `${date}T${timeFrom}:00`;
    const manilaEnd = `${date}T${timeTo}:00`;
    const startUTC = dayjs.tz(manilaStart, 'Asia/Manila').utc().toDate();
    const endUTC = dayjs.tz(manilaEnd, 'Asia/Manila').utc().toDate();

    const ev = new Event({
      eventName: title,
      eventDescription: description || '',
      startDateTime: startUTC,
      endDateTime: endUTC,
      expectedAttendees: Number(expectedAttendees) || 0,
      type: type || 'General',
    });

    await ev.save();

    return res.status(201).json({ success: true, eventId: ev._id });
  } catch (err) {
    console.error('POST /api/events error', err);
    await logError(err, req);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * GET /api/events/:id
 */
router.get('/events/:id', async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id).lean();
    if (!ev) return res.status(404).json({ success: false, message: 'Event not found' });

    const start = dayjs(ev.startDateTime).tz('Asia/Manila').format();
    const end = dayjs(ev.endDateTime).tz('Asia/Manila').format();

    return res.json({ success: true, event: { ...ev, start, end } });
  } catch (err) {
    console.error('GET /api/events/:id error', err);
    await logError(err, req);
    return res.status(500).json({ success: false });
  }
});

/**
 * PUT /api/events/:id
 * Accepts same body as POST /api/events
 */
router.put('/events/:id', async (req, res) => {
  try {
    const { title, description, date, timeFrom, timeTo, type, expectedAttendees } = req.body;
    if (!date || !timeFrom || !timeTo) {
      return res.status(400).json({ success: false, message: 'Date + time required' });
    }
    const manilaStart = `${date}T${timeFrom}:00`;
    const manilaEnd = `${date}T${timeTo}:00`;
    const startUTC = dayjs.tz(manilaStart, 'Asia/Manila').utc().toDate();
    const endUTC = dayjs.tz(manilaEnd, 'Asia/Manila').utc().toDate();

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      {
        eventName: title,
        eventDescription: description,
        startDateTime: startUTC,
        endDateTime: endUTC,
        expectedAttendees: Number(expectedAttendees) || 0,
        type,
      },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ success: false, message: 'Event not found' });
    return res.json({ success: true, event: updated });
  } catch (err) {
    console.error('PUT /api/events/:id error', err);
    await logError(err, req);
    return res.status(500).json({ success: false });
  }
});

/**
 * DELETE /api/events/:id
 */
router.delete('/events/:id', requireAdmin, async (req, res) => {
  try {
    const removed = await Event.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ success: false, message: 'Event not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/events/:id error', err);
    await logError(err, req);
    return res.status(500).json({ success: false });
  }
});

export default router;
