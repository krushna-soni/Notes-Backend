const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const notesRoutes = require('./routes/notes');
const userRoutes = require('./routes/users'); // For user authentication

dotenv.config();
connectDB();

const app = express();

// Use CORS middleware to allow frontend access
app.use(
  cors({
    origin: 'http://localhost:3000', // Update with your frontend's URL in production
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  })
);

app.use(bodyParser.json());

// Middleware to verify JWT
app.use((req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach decoded user info to request object
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  next();
});

// Routes
app.use('/uploads', express.static('uploads'));
app.use('/api/notes', notesRoutes); // Notes routes
app.use('/api/auth', userRoutes); // User authentication routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
