const Vehicle = require('../models/vehicle');
const Settings = require('../models/settings');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.customId.startsWith('admindel_')) return;

    
    const targetId = interaction.customId.split('admindel_')[1];
    const vehicleId = interaction.values[0];

    const settings = await Settings.findOne({ guildId: interaction.guild.id });
    const adminRoles = settings?.adminRoleIds || [];
    const hasAdminRole = interaction.member.roles.cache.some(r => adminRoles.includes(r.id));

    if (!interaction.member.permissions.has('Administrator') && !hasAdminRole)
      return interaction.reply({ content: 'You do not have permission.', ephemeral: true });

    const vehicle = await Vehicle.findOne({ _id: vehicleId, guildId: interaction.guild.id, userId: targetId });

    if (!vehicle)
      return interaction.reply({ content: 'Vehicle not found.', ephemeral: true });

    await Vehicle.deleteOne({ _id: vehicleId });

    const embed = new EmbedBuilder()
      .setTitle('Vehicle Deleted')
      .setDescription(`${vehicle.year} ${vehicle.brand} ${vehicle.model} has been removed.`)
      .setColor(settings?.embedcolor || '#d22b2b');

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}