// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_a_strong_secret';
const TOKEN_NAME = 'auth_token';

export function requireAuth(req, res, next) {
  const token = req.cookies?.[TOKEN_NAME] || req.headers?.authorization?.split?.(' ')[1];

  if (!token) {
    // Browser redirect version
    return res.redirect('/login');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.redirect('/login');
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.redirect('/login'); // or a custom 403 page
    }
    return next();
  });
}
