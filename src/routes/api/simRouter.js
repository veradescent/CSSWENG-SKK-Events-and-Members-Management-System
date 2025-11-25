// src/routes/api/simRouter.js
import { Router } from 'express';
import Member from '../../models/membersModel.js'; // adjust if your filename differs

const router = Router();

/**
 * GET /api/sims
 * Returns:
 * { success: true, sims: [{ name: 'Kids', id: 'Kids', members: [{_id, name, email}], count: N }, ...] }
 */
router.get('/', async (req, res) => {
  try {
    // If your Member schema uses simName or simId, update the query/field below.
    // We group by `simName` field; if your schema uses `sim` or `simId` change accordingly.
    const simsOfInterest = ['Kids', 'Youth', 'YoAds', 'WOW', 'DIG'];

    // fetch members in these sims
    const members = await Member.find({ simName: { $in: simsOfInterest } })
      .select('_id name email simName')
      .lean();

    const map = {};
    simsOfInterest.forEach((s) => (map[s] = { name: s, members: [], count: 0 }));

    members.forEach((m) => {
      const s = m.simName || 'Unknown';
      if (!map[s]) map[s] = { name: s, members: [], count: 0 };
      map[s].members.push({ _id: m._id, name: m.name || '', email: m.email || '' });
      map[s].count++;
    });

    const sims = Object.values(map);
    return res.json({ success: true, sims });
  } catch (err) {
    console.error('Failed to load sims', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
