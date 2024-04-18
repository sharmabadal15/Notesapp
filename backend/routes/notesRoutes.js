// routes/notesRoutes.js

const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// CRUD endpoints for notes
router.post('/', authenticateUser, noteController.createNote);
router.get('/', authenticateUser, noteController.getNotes);
router.get('/:id', authenticateUser, noteController.getNoteById);
router.put('/:id', authenticateUser, noteController.updateNote);
router.delete('/:id', authenticateUser, noteController.deleteNote);

// Authentication function
function authenticateUser(req, res, next) {
  // Your authentication logic here
  // Check if user is logged in, has valid token, etc.
  // Example: Check if user object exists in request
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  // If authentication succeeds, call next to proceed to the next middleware or route handler
  next();
}

module.exports = router;
