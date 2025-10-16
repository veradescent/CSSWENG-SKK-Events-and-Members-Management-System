require('dotenv').config(); //environment variables
const express = require('express'); //express
const handlebars = require('express-handlebars');
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public')); // Static Files

// Handlebars
app.engine('hbs', handlebars.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: './src/views/layouts',
    partialsDir: './src/views/partials',
    helpers: {
        eq: (a, b) => {return a === b;}
    }
}));
app.set('view engine', 'hbs');
app.set('views', './src/views/')

// Connect to MongoDB
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.render("adminHomePage");
});

app.get("/member-database", (req, res) => {
  res.render("memberDatabase");
});

// Start app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
