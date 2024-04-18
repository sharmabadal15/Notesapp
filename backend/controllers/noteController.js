
const pool = require('../db');
// exports.createNote = async (req, res) => {
//     try {
//       const { title, content } = req.body;
//       const userId = req.user.id; // Assuming you have a user object attached to the request after authentication
//       const query = 'INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING *';
//       const { rows } = await pool.query(query, [title, content, userId]);
//       res.status(201).json({ note: rows[0] });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   };

exports.createNote = async (req, res) => {
    try {
      const { title, content } = req.body;
      const userId = req.user.id; // Assuming you have a user object attached to the request after authentication
      const note = await Note.create({ title, content, userId });
      res.status(201).json({ note });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
exports.getNotes = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have a user object attached to the request after authentication
    const notes = await db.Note.findAll({ where: { userId } });
    res.status(200).json({ notes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Assuming you have a user object attached to the request after authentication
    const note = await db.Note.findOne({ where: { id, userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id; // Assuming you have a user object attached to the request after authentication
    const note = await db.Note.findOne({ where: { id, userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    await db.Note.update({ title, content }, { where: { id, userId } });
    res.status(200).json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Assuming you have a user object attached to the request after authentication
    const note = await db.Note.findOne({ where: { id, userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    await db.Note.destroy({ where: { id, userId } });
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
