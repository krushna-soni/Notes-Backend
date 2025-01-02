const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const Note = require('../models/Note');
const { verifyToken } = require('./auth'); // Middleware for token verification
const router = express.Router();

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'notes', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed file formats
  },
});
const upload = multer({ storage });

// CRUD Endpoints

// GET All Notes for Logged-in User
router.get('/', verifyToken, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }); // Fetch notes for logged-in user
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// GET Note by ID (Logged-in User)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id }); // Fetch note for logged-in user
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch note' });
  }
});

// POST Create Note (for Logged-in User)
// POST Create Note (for Logged-in User)
router.post('/', verifyToken, upload.array('images', 10), async (req, res) => {
  const { title, content } = req.body;
  const images = req.files ? req.files.map(file => file.path) : []; // Cloudinary URLs

  try {
    const newNote = await Note.create({ title, content, images, userId: req.user.id });
    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create note' });
  }
});

// PUT Update Note (for Logged-in User)
router.patch('/:id', verifyToken, upload.array('images', 10), async (req, res) => {
  const { title, content } = req.body;
  const images = req.files ? req.files.map(file => file.path) : undefined;

  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { 
        title, 
        content, 
        images: images || note.images // Retain old images if no new files are uploaded
      },
      { new: true }
    );

    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update note' });
  }
});


// DELETE Note (for Logged-in User)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id }); // Delete only for logged-in user
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
