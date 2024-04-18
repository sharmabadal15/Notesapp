// models/note.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Note = sequelize.define('Note', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Note;
