// src/routes/reports.js
import express from 'express';
import Event from '../models/eventsModel.js';
import { requireAdmin } from '../middleware/authMiddleware.js'; // <-- added
const router = express.Router();

/**
 * Public reports page: accessible to guests and logged-in users.
 * We prefer res.locals.user (set globally in app.js) but fall back to req.user if needed.
 */
router.get('/reports', (req, res) => {
  try {
    const userForTemplate = res.locals.user ?? req.user ?? null;

    return res.render('reports', {
      title: 'Reports',
      user: userForTemplate,
      previousEvents: [] // safe default; frontend will fetch actual previous events
    });
  } catch (err) {
    console.error('Error rendering /reports:', err);

    const userForTemplate = res.locals.user ?? req.user ?? null;

    return res.status(500).render('reports', {
      title: 'Reports',
      user: userForTemplate,
      previousEvents: []
    });
  }
});

// Public API: fetch previous events (same behavior as before)
router.get('/api/reports/previous', async (req, res) => {
  try {
    const { year, month } = req.query;
    if (typeof year === 'undefined' || typeof month === 'undefined') {
      return res.json({ success: false, events: [] });
    }

    const start = new Date(Number(year), Number(month), 1, 0, 0, 0, 0);
    const end = new Date(Number(year), Number(month) + 1, 0, 23, 59, 59, 999);
    const now = new Date();

    const events = await Event.find({
      $and: [
        { startDateTime: { $gte: start, $lte: end } }, // inside month range
        { startDateTime: { $lt: now } }               // already past
      ]
    })
      .sort({ startDateTime: -1 })
      .lean();

    const formatted = events.map(e => ({
      _id: e._id,
      title: e.eventName || e.title || 'Untitled',
      location: e.location || '',
      eventDescription: e.eventDescription || '',
      startDateTime: e.startDateTime,
      endDateTime: e.endDateTime,
      expectedAttendees: e.expectedAttendees ?? 0,
      type: e.type || '',
      displayDate: e.startDateTime ? new Date(e.startDateTime).toLocaleDateString() : '',
      displayStartTime: e.startDateTime ? new Date(e.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      displayEndTime: e.endDateTime ? new Date(e.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      minutesLink: e.minutesLink || e.minutes_link || '' // include minutes link for UI convenience
    }));

    return res.json({ success: true, events: formatted });
  } catch (err) {
    console.error('Error in /api/reports/previous:', err);
    return res.json({ success: false, events: [] });
  }
});

/**
 * Admin-only: add a previous event (used by the Add Previous Event form).
 * Protect with requireAdmin so only admins can create previous events.
 *
 * NOTE: your frontend currently posts to /api/events/previous — if you prefer that exact path
 * either change the client or duplicate this route path. For now this router exposes:
 * POST /api/reports/previous
 */
router.post('/api/reports/previous', requireAdmin, async (req, res) => {
  try {
    const payload = req.body || {};
    // minimal validation
    if (!payload.title || !payload.startDateTime) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const newEvent = new Event({
      title: payload.title,
      eventName: payload.title,
      eventDescription: payload.eventDescription || '',
      location: payload.location || '',
      startDateTime: payload.startDateTime,
      endDateTime: payload.endDateTime || payload.startDateTime,
      expectedAttendees: payload.expectedAttendees ?? 0,
      type: payload.type || '',
      // keep minutesLink if provided at creation time
      minutesLink: payload.minutesLink || ''
    });

    await newEvent.save();
    return res.json({ success: true, event: newEvent });
  } catch (err) {
    console.error('Error in POST /api/reports/previous:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * Admin-only: update minutes link for an event.
 * Client expects PUT /events/:id/minutes (as used in the injected JS).
 */
router.put('/events/:id/minutes', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { minutesLink } = req.body;

    if (!id) return res.status(400).json({ success: false, error: 'Missing event id' });

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });

    event.minutesLink = minutesLink ? String(minutesLink).trim() : '';
    await event.save();

    return res.json({ success: true, minutesLink: event.minutesLink });
  } catch (err) {
    console.error('Error in PUT /events/:id/minutes:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/api/reports/previous-all', requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find({ startDateTime: { $lt: now } })
      .sort({ startDateTime: -1 })
      .lean();

    const formatted = events.map(e => ({
      _id: e._id,
      title: e.eventName || e.title || 'Untitled',
      eventName: e.eventName || e.title || 'Untitled',
      location: e.location || '',
      eventDescription: e.eventDescription || '',
      startDateTime: e.startDateTime,
      endDateTime: e.endDateTime,
      expectedAttendees: e.expectedAttendees ?? 0,
      type: e.type || '',
      image: e.image || '',
      minutesLink: e.minutesLink || e.minutes_link || '',
      displayDate: e.startDateTime ? new Date(e.startDateTime).toLocaleDateString() : '',
      displayStartTime: e.startDateTime ? new Date(e.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      displayEndTime: e.endDateTime ? new Date(e.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    }));

    return res.json({ success: true, events: formatted });
  } catch (err) {
    console.error('Error in /api/reports/previous-all:', err);
    return res.status(500).json({ success: false, events: [], error: 'Server error' });
  }
});
export default router;
