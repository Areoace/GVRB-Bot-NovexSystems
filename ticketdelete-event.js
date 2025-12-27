const Ticket = require('../models/ticket');
const Settings = require('../models/settings');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.customId.startsWith('adminticketdel_')) return;

    const targetId = interaction.customId.split('adminticketdel_')[1];
    const ticketId = interaction.values[0];

    const settings = await Settings.findOne({ guildId: interaction.guild.id });
    const adminRoles = settings?.adminRoleIds || [];
    const hasAdminRole = interaction.member.roles.cache.some(r => adminRoles.includes(r.id));

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !hasAdminRole)
      return interaction.reply({ content: 'You do not have permission.', ephemeral: true });

    const ticket = await Ticket.findOne({ _id: ticketId, guildId: interaction.guild.id, userId: targetId });

    if (!ticket)
      return interaction.reply({ content: 'Ticket not found.', ephemeral: true });

    await Ticket.deleteOne({ _id: ticketId });

    const embed = new EmbedBuilder()
      .setTitle('Ticket Deleted')
      .setDescription(`Offense: ${ticket.offenseId}\nPrice: $${ticket.price}`)
      .setColor(settings?.embedcolor || '#d22b2b');

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
