// src/routes/api/previousEventsRouter.js
import { Router } from 'express';
import Event from '../../models/eventsModel.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import logError from '../../../logError.js';
import { requireAdmin } from '../../middleware/authMiddleware.js'; // adjust path if needed

dayjs.extend(utc);
dayjs.extend(timezone);

const router = Router();

/**
 * POST /api/events/previous
 * Add a previous (past) event. The UI sends a "previous event" form.
 *
 * Expected body fields:
 * - title / eventName
 * - eventDescription
 * - location (optional)
 * - type (optional; we'll default to 'Other' if missing)
 * - startDateTime / endDateTime (dates)
 * - expectedAttendees
 *
 * Returns 201 on success, 500 on server error.
 */
router.post('/previous', requireAdmin, async (req, res) => {
  try {
    // include 'type' in destructure so missing field won't be entirely omitted
    const {
      title,
      eventName,
      eventDescription,
      location,
      type,
      startDateTime,
      endDateTime,
      expectedAttendees,
    } = req.body || {};

    // Normalize name fields: prefer eventName, fallback to title
    const name = eventName || title || 'Untitled Event';

    // Validate dates (very simple validation here; adjust as needed)
    const start = startDateTime ? new Date(startDateTime) : null;
    const end = endDateTime ? new Date(endDateTime) : null;

    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start or end date' });
    }

    // Create the event object; ensure `type` has a sane default so Mongoose required validators don't fail
    const newEvent = new Event({
      eventName: name,
      eventDescription: eventDescription || '',
      location: location || '',
      type: type || 'Other', // <-- important to prevent "Path `type` is required" errors
      startDateTime: start,
      endDateTime: end,
      expectedAttendees: expectedAttendees ? Number(expectedAttendees) : 0,
      status: 'previous',
    });

    await newEvent.save();

    return res
      .status(201)
      .json({ success: true, message: 'Previous event added', event: newEvent });
  } catch (err) {
    console.error('Add previous event error', err);
    // Use our centralized logger (it will not crash if logging fails)
    await logError(err, req);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
