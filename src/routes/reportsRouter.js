// src/routes/reports.js
import express from 'express';
import Event from '../models/eventsModel.js'; // ensure this path matches your project
const router = express.Router();

// Render reports page (public). Do NOT force authentication here so guests can view.
// If a user is logged in, req.user will still be available and passed to the template.
router.get('/reports', (req, res) => {
  try {
    return res.render('reports', {
      title: 'Reports',
      user: req.user || null,
      // Provide an empty array so the template's {{#each previousEvents}} is safe.
      // If you prefer to server-render previous events for the current month, replace [] with a DB query.
      previousEvents: []
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

// API: fetch previous events for a selected month (keeps original behavior)
router.get('/api/reports/previous', async (req, res) => {
  try {
    const { year, month } = req.query;
    if (typeof year === 'undefined' || typeof month === 'undefined') {
      return res.json({ success: false, events: [] });
    }

    // months in JS Date are 0-indexed; frontend sends currentDate.getMonth()
    const start = new Date(Number(year), Number(month), 1, 0, 0, 0, 0);
    const end = new Date(Number(year), Number(month) + 1, 0, 23, 59, 59, 999);

    // ensure we only return events that already occurred (start before now)
    const now = new Date();

    const events = await Event.find({
      $and: [
        { startDateTime: { $gte: start, $lte: end } }, // inside month range
        { startDateTime: { $lt: now } }               // already past (start before now)
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
