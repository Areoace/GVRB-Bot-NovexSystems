const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Settings = require('../../models/settings');
const License = require('../../models/license');
const Ticket = require('../../models/ticket');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('activatelicense')
    .setDescription('Activate your suspended license'),

  async execute(interaction) {
    const settings = await Settings.findOne({ guildId: interaction.guild.id });
    const civRoles = settings?.civiRoleIds || [];
    const color = settings?.embedcolor || '#d22b2b';

    const member = interaction.member;
    const hasCiv = member.roles.cache.some(r => civRoles.includes(r.id));

    if (!hasCiv)
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });

    const license = await License.findOne({ guildId: interaction.guild.id, targetId: interaction.user.id });

    if (!license)
      return interaction.reply({ content: 'You do not have a license record.', ephemeral: true });

    if (license.status !== 'Suspended')
      return interaction.reply({ content: 'Your license is not suspended.', ephemeral: true });

    const unpaidTickets = await Ticket.find({ guildId: interaction.guild.id, targetId: interaction.user.id });

    if (unpaidTickets.length > 0)
      return interaction.reply({ content: 'You must pay all outstanding tickets before activating your license.', ephemeral: true });

    license.status = 'Active';
    await license.save();

    const embed = new EmbedBuilder()
      .setTitle('License Activated')
      .setDescription('Your license has been successfully reactivated.')
      .setColor(color);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
