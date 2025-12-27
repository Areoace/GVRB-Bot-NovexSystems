const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const Settings = require('../../models/settings');
const Ticket = require('../../models/ticket');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketdel')
    .setDescription('Delete a user ticket')
    .addUserOption(o =>
      o.setName('user')
        .setDescription('Select a user')
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const settings = await Settings.findOne({ guildId: interaction.guild.id });

    const adminRoles = settings?.adminRoleIds || [];
    const hasAdminRole = interaction.member.roles.cache.some(r => adminRoles.includes(r.id));

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !hasAdminRole)
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });

    const tickets = await Ticket.find({ guildId: interaction.guild.id, userId: target.id });

    if (tickets.length === 0)
      return interaction.reply({ content: 'This user has no tickets.', ephemeral: true });

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`adminticketdel_${target.id}`)
      .setPlaceholder('Select a ticket to delete')
      .addOptions(
        tickets.map(t => ({
          label: `${t.offenseId} - $${t.price}`,
          description: `Ticket ID: ${t._id.toString().slice(-6)}`,
          value: t._id.toString()
        }))
      );

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('Select Ticket to Delete')
      .setDescription(`Choose a ticket issued to <@${target.id}>.`)
      .setColor(settings?.embedcolor || '#d22b2b');

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
