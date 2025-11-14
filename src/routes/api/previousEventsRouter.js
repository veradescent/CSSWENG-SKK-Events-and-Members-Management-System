import { Router } from 'express';
import Event from '../../models/eventsModel.js';
import jwt from 'jsonwebtoken';    // ✅ FIXED IMPORT

const router = Router();

router.post('/', async (req, res) => {
  try {
    // ===== AUTH CHECK (Admin only) =====
    const token =
      req.cookies?.auth_token ||
      req.headers.authorization?.split(' ')[1];

    if (!token)
      return res.status(401).json({ success: false, message: 'Auth required' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    if (!payload || payload.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }

    // ===== Validate body =====
    const {
      title,
      eventDescription,
      location,
      startDateTime,
      endDateTime,
      expectedAttendees,
      type
    } = req.body;

    // Previous event MUST be before now
    if (!startDateTime || new Date(startDateTime) >= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'startDateTime must be before now'
      });
    }

    // ===== Create event =====
    const newEvent = new Event({
      title,
      eventDescription,
      location,
      startDateTime: new Date(startDateTime),
      endDateTime: endDateTime ? new Date(endDateTime) : null,
      expectedAttendees: Number(expectedAttendees || 0),
      type,
      status: 'previous' // optional marker
    });

    await newEvent.save();

    return res.json({
      success: true,
      message: 'Previous event added',
      event: newEvent
    });
  } catch (err) {
    console.error('Add previous event error', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
