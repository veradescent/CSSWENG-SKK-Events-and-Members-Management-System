// src/routes/reports.js
import express from 'express';
const router = express.Router();

// Optional: import requireLogin/requireRole middleware if you want protection
// import { requireLogin, requireRole } from '../middleware/authMiddleware.js';

router.get('/reports', /* requireLogin, requireRole('admin'), */ (req, res) => {
  // prepare any data you want to show in the reports page
  const data = {
    title: 'Reports',
    // pass counts/stats if you want: eventsCount: 10, membersCount: 42
  };
  return res.render('reports', data); // renders views/reports.hbs
});

export default router;
