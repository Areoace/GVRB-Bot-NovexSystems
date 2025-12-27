const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  year: { type: Number, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  color: { type: String, required: true },
  numberPlate: { type: String, required: true }
});

module.exports = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);