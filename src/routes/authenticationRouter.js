// src/routes/authenticationRouter.js
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_a_strong_secret';
const TOKEN_NAME = 'auth_token';
const SALT_ROUNDS = 12;

router.get('/login', (req, res) => {
  return res.render('login', { title: 'Login', layout: false });
});

router.get('/register', (req, res) => {
  return res.render('register', { title: 'Register', layout: false });
});
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'username, email and password required' });
    }

    // Prevent multiple username
    const existing = await User.findOne({ username }).exec();
    if (existing) {
      return res.status(409).json({ success: false, message: 'Username already taken' });
    }

    // Role is forced to admin — ignore any role sent in request
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      username,
      email,
      password_hash,
      role: 'admin',
    });

    await user.save();
    return res.status(201).json({ success: true, message: 'Admin created' });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .render('login', { title: 'Login', error: 'Email and password required', layout: false });
    }

    const user = await User.findOne({ email }).lean().exec();
    if (!user) {
      return res
        .status(401)
        .render('login', { title: 'Login', error: 'Invalid credentials', layout: false });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res
        .status(401)
        .render('login', { title: 'Login', error: 'Invalid credentials', layout: false });
    }

    const payload = { id: user._id.toString(), username: user.username, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // set httpOnly cookie
    res.cookie(TOKEN_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      // secure: true, // enable in production (HTTPS)
      maxAge: 1000 * 60 * 60 * 8,
    });

    // Redirect based on role
    if (user.role === 'admin') {
      return res.redirect('/'); // admin homepage route (protected by requireAdmin)
    } else {
      return res.redirect('/calendar'); // non-admin landing page — change as desired
    }
  } catch (err) {
    console.error('Login error', err);
    return res
      .status(500)
      .render('login', { title: 'Login', error: 'Server error', layout: false });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(TOKEN_NAME);
  return res.redirect('/');
});

export default router;
