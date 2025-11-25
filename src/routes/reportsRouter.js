// src/routes/reports.js
import express from 'express';
import Event from '../models/eventsModel.js';
const router = express.Router();

// Public reports page: accessible to guests and logged-in users.
// Pass req.user (or null) so navbar can render properly.
router.get('/reports', (req, res) => {
  try {
    return res.render('reports', {
      title: 'Reports',
      user: req.user || null,
      previousEvents: [] // safe default; frontend will fetch actual previous events
    });
  } catch (err) {
    console.error('Error rendering /reports:', err);
    return res.status(500).render('reports', {
      title: 'Reports',
      user: req.user || null,
      previousEvents: []
    });
  }
});

// API: fetch previous events (same behavior as before)
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
      displayEndTime: e.endDateTime ? new Date(e.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    }));

    return res.json({ success: true, events: formatted });
  } catch (err) {
    console.error('Error in /api/reports/previous:', err);
    return res.json({ success: false, events: [] });
  }
});

export default router;
