const mongoose = require("mongoose");

const SessionLogSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  type: String,
  startTime: Number,
  endTime: Number
});

module.exports = mongoose.model("SessionLog", SessionLogSchema);
