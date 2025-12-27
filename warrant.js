const mongoose = require('mongoose');

const warrantSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  targetId: { type: String, required: true },
  offense: { type: String, required: true },
  reason: { type: String, required: true },
  date: { type: Date, required: true }
});

module.exports = mongoose.models.Warrant || mongoose.model('Warrant', warrantSchema);