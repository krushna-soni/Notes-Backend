const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const Note = require('../models/Note');
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

// GET All Notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// GET Note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch note' });
  }
});


// POST Create Note
router.post('/', upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? req.file.path : null; // Cloudinary URL
  try {
    const newNote = await Note.create({ title, content, image });
    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create note' });
  }
});

// PUT Update Note
router.put('/:id', upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? req.file.path : null; // Cloudinary URL
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, image },
      { new: true }
    );
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update note' });
  }
});

// DELETE Note
router.delete('/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
