const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const Settings = require('../../models/settings');
const Vehicle = require('../../models/vehicle');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vehicledel')
    .setDescription('Delete a user vehicle')
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

    const vehicles = await Vehicle.find({ guildId: interaction.guild.id, userId: target.id });

    if (vehicles.length === 0)
      return interaction.reply({ content: 'This user has no registered vehicles.', ephemeral: true });

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`admindel_${target.id}`)
      .setPlaceholder('Select a vehicle to delete')
      .addOptions(
        vehicles.map(v => ({
          label: `${v.year} ${v.brand} ${v.model}`,
          description: `Plate: ${v.numberPlate}`,
          value: v._id.toString()
        }))
      );

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('Select Vehicle to Delete')
      .setDescription(`Choose a vehicle registered by <@${target.id}>.`)
      .setColor(settings?.embedcolor || '#d22b2b');

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
