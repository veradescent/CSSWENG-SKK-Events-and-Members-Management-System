require('dotenv').config(); //environment variables
const express = require('express'); //express
const handlebars = require('express-handlebars');
const mongoose = require("mongoose");

const server = express();

// Middleware
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.use(express.static('public')); // Static Files

// Handlebars
server.engine('hbs', handlebars.engine({
    extname: 'hbs',
    helpers: {
        eq: (a, b) => {return a === b;}
    }
}));
server.set('view engine', 'hbs');

// Connect to MongoDB
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Routes
server.get("/", (req, res) => {
  res.render("index");
});

server.get("/member-database", (req, res) => {
  res.render("member-database");
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
