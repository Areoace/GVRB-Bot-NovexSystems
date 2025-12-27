const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Settings = require('../../models/settings');
const Vehicle = require('../../models/vehicle');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unregister')
    .setDescription('Unregister one of your vehicles')
    .addStringOption(o =>
      o.setName('vehicle')
        .setDescription('Select a vehicle')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction) {
    const id = interaction.options.getString('vehicle');
    const settings = await Settings.findOne({ guildId: interaction.guild.id });
    const vehicle = await Vehicle.findOne({ _id: id, guildId: interaction.guild.id, userId: interaction.user.id });

    if (!vehicle)
      return interaction.reply({ content: 'Vehicle not found.', ephemeral: true });

    await Vehicle.deleteOne({ _id: id });

    const embed = new EmbedBuilder()
      .setTitle('Vehicle Unregistered')
      .setDescription(`${vehicle.year} ${vehicle.brand} ${vehicle.model} has been removed.`)
      .setColor(settings?.embedcolor || '#d22b2b');

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
