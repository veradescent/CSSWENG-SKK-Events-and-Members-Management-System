import 'dotenv/config.js'; //environment variables
import express from 'express'; //express
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './src/routes/index.js';
import cookieParser from 'cookie-parser';
import eventsRouter from './src/routes/eventsRouter.js';
import jwt from 'jsonwebtoken';
import previousEventsRouter from './src/routes/api/previousEventsRouter.js';
import memberDBRouter from './src/routes/memberDatabase.js';
import reportsRouter from './src/routes/reportsRouter.js';
// Setup Paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create App
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// MIDDLEWARE (USER CONDITIONS)
const TOKEN_NAME = 'auth_token';
const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_a_strong_secret';

app.use((req, res, next) => {
  const token = req.cookies?.[TOKEN_NAME];

  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Normalize user for templates and other middleware:
    // keep original payload fields, but expose isAdmin for Handlebars checks.
    const normalizedUser = {
      ...payload,
      isAdmin: payload?.role === 'admin',
    };

    // Make the normalized user available to templates (res.locals) and to req.user
    res.locals.user = normalizedUser; // user is now available in ALL .hbs templates
    req.user = payload; // keep original payload on req.user for existing auth logic
  } catch {
    res.locals.user = null;
  }

  next();
});

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
app.use('/api/events/previous', previousEventsRouter);
app.use('/events', eventsRouter);
app.use('/', memberDBRouter);
app.use('/', reportsRouter);

// Handlebars
app.engine(
  'hbs',
  handlebars.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: './src/views/layouts',
    partialsDir: './src/views/partials',
    helpers: {
      eq: (a, b) => {
        return a === b;
      },
    },
  })
);
app.set('view engine', 'hbs');
app.set('views', './src/views/');

async function main() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => console.log('MongoDB connected'))
      .catch((err) => console.error('MongoDB connection error:', err));

    app.use('/', router);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start app:', error);
  }
}

main();
