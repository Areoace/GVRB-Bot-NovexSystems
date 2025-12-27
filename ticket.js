const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  targetId: { type: String, required: true },
  offense: { type: String, required: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);