// src/routes/api/participationApiRouter.js
import { Router } from 'express';
import Participation from '../../models/participationModel.js';
import Member from '../../models/memberModel.js';
import Event from '../../models/eventsModel.js';
import logError from '../../../logError.js';
import { requireAdmin } from '../../middleware/authMiddleware.js';

const router = Router();

/**
 * POST /api/events/:id/participate
 * Body: { memberId }
 */
router.post('/events/:id/participate', requireAdmin, async (req, res) => {
  try {
    const eventId = req.params.id;
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ success: false, message: 'memberId required' });

    // validate
    const member = await Member.findById(memberId);
    const event = await Event.findById(eventId);
    if (!member || !event)
      return res.status(404).json({ success: false, message: 'Member or event not found' });

    // avoid duplicate
    const exists = await Participation.findOne({ user: memberId, eventskk: eventId });
    if (exists) return res.status(200).json({ success: true, message: 'Already participating' });

    const p = new Participation({ user: memberId, eventskk: eventId });
    await p.save();

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST participation error', err);
    await logError(err, req);
    return res.status(500).json({ success: false });
  }
});

/**
 * DELETE /api/events/:id/participate/:memberId
 */
router.delete('/events/:id/participate/:memberId', requireAdmin, async (req, res) => {
  try {
    const { id: eventId, memberId } = req.params;
    const removed = await Participation.findOneAndDelete({ user: memberId, eventskk: eventId });
    if (!removed)
      return res.status(404).json({ success: false, message: 'Participation not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE participation error', err);
    await logError(err, req);
    return res.status(500).json({ success: false });
  }
});

export default router;
