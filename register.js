const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Settings = require('../../models/settings');
const Vehicle = require('../../models/vehicle');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register a vehicle')
    .addIntegerOption(o => o.setName('year').setDescription('Vehicle year').setRequired(true))
    .addStringOption(o => o.setName('brand').setDescription('Vehicle brand').setRequired(true))
    .addStringOption(o => o.setName('model').setDescription('Vehicle model').setRequired(true))
    .addStringOption(o => o.setName('color').setDescription('Vehicle color').setRequired(true))
    .addStringOption(o => o.setName('numberplate').setDescription('Number plate').setRequired(true)),

  async execute(interaction) {
    const year = interaction.options.getInteger('year');
    const brand = interaction.options.getString('brand');
    const model = interaction.options.getString('model');
    const color = interaction.options.getString('color');
    const numberPlate = interaction.options.getString('numberplate');

    const settings = await Settings.findOne({ guildId: interaction.guild.id });
    if (!settings || !settings.civiRoleIds || settings.civiRoleIds.length === 0)
      return interaction.reply({ content: 'Civilian roles are not set.', ephemeral: true });

    const hasRole = interaction.member.roles.cache.some(r => settings.civiRoleIds.includes(r.id));
    if (!hasRole)
      return interaction.reply({ content: 'You do not have the civilian role.', ephemeral: true });

    const existing = await Vehicle.find({ guildId: interaction.guild.id, userId: interaction.user.id });

    let cap = 5;
    if (settings.vehicleCaps && settings.vehicleCaps.length > 0) {
      for (const c of settings.vehicleCaps) {
        if (interaction.member.roles.cache.has(c.roleId)) {
          if (c.cap > cap) cap = c.cap;
        }
      }
    }

    if (existing.length >= cap)
      return interaction.reply({ content: `You reached your vehicle limit of ${cap}.`, ephemeral: true });

    await Vehicle.create({
      guildId: interaction.guild.id,
      userId: interaction.user.id,
      year,
      brand,
      model,
      color,
      numberPlate
    });

    const embed = new EmbedBuilder()
      .setTitle('Vehicle Registered')
      .setDescription(`Your ${color}, ${year} ${brand} ${model} with the numberplate ${numberPlate} has been registered.`)
      .setColor(settings.embedcolor || '#d22b2b');

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
