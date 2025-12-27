const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  welcomechannelid: { type: String, default: null },
  logChannelId: { type: String, default: null },

  leoRoleIds: [{ type: String, default: null }],
  civiRoleIds: [{ type: String, default: null }],
  eaRoleIds: [{ type: String, default: null }],
  staffRoleIds: [{ type: String, default: null }],
  adminRoleIds: [{ type: String, default: null }],

  embedcolor: { type: String, default: '#d22b2b' },

  vehicleCaps: [
    {
      roleId: { type: String, required: true },
      cap: { type: Number, required: true }
    }
  ],

  startupEmbed: { title: String, description: String, image: String },
  profileEmbed: { title: String, description: String, image: String },
  eaEmbed: { title: String, description: String, image: String },
  welcomeEmbed: { title: String, description: String, image: String },
  cohostEmbed: { title: String, description: String, image: String },
  cohostendEmbed: { title: String, description: String, image: String },
  ticketsupportEmbed: { title: String, description: String, image: String },
  setupEmbed: { title: String, description: String, image: String },
  releaseEmbed: { title: String, description: String, image: String },
  reinvitesEmbed: { title: String, description: String, image: String },
  reinvitesendEmbed: { title: String, description: String, image: String },
  overEmbed: { title: String, description: String, image: String },
  cancelEmbed: { title: String, description: String, image: String }
});

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
