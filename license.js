const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  targetId: { type: String, required: true },
  status: { type: String, required: true }
});

module.exports = mongoose.models.License || mongoose.model('License', licenseSchema);