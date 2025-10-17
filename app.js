import "dotenv/config.js"; //environment variables
import express from 'express'; //express
import handlebars from 'express-handlebars';
import mongoose from "mongoose";
import path from 'path';
import { fileURLToPath } from 'url';
import router from "./src/routes/index.js";


// Setup Paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create App
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public')); // Static Files

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

async function main() {
    try {
        // Connect to MongoDB
        mongoose.set('strictQuery', true);
        await mongoose.connect(process.env.MONGODB_URI)
            .then(() => console.log("MongoDB connected"))
            .catch(err => console.error("MongoDB connection error:", err));

        app.use('/', router);

        // Start app
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error("Failed to start app:", error);
    }
}

main();

