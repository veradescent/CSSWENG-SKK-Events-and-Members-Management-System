import { Router } from 'express';
const router = Router();

router.get('/login', (req, res) => {
    return res.render('login', { title: 'Login', layout: false });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    return res.status(501).json({ success: false, message: 'Authentication not implemented' });
});

export default router;

