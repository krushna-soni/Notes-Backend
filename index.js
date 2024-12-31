const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors'); // Import cors middleware
const connectDB = require('./config/db');
const notesRoutes = require('./routes/notes');

dotenv.config();
connectDB();

const app = express();

// Use CORS middleware to allow frontend access
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's URL in production
  methods: 'GET,POST,PUT,DELETE', // Specify allowed methods
  allowedHeaders: 'Content-Type,Authorization', // Specify allowed headers
}));

app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/notes', notesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
