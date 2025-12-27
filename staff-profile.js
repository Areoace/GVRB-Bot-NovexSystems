const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Settings = require("../../models/settings");
const SessionLog = require("../../models/sessionlog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("staffprofile")
    .setDescription("View a staff member profile")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Select the staff member")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const { guild, member } = interaction;
      const guildId = guild.id;

      const settings = await Settings.findOne({ guildId });
      if (!settings) return interaction.reply({ content: "Server settings not configured.", ephemeral: true });

      const staffRoles = settings.staffRoleIds || [];
      if (!staffRoles.length) return interaction.reply({ content: "Staff roles not set in settings.", ephemeral: true });

      const hasStaffRole = staffRoles.some(id => member.roles.cache.has(id));
      if (!hasStaffRole) return interaction.reply({ content: "You do not have permission to view staff profiles.", ephemeral: true });

      const target = interaction.options.getUser("user");
      const targetId = target.id;

      const sessionCount = await SessionLog.countDocuments({ guildId, userId: targetId, type: "session" });
      const cohostCount = await SessionLog.countDocuments({ guildId, userId: targetId, type: "cohost" });

      const embed = new EmbedBuilder()
        .setTitle(`${target.username}'s Staff Profile`)
        .setDescription(`**User**: ${target}

**Sessions Count**: ${sessionCount}
**Cohost Count**: ${cohostCount}`)
        .setColor(settings.embedcolor || "#2b2d31")
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`session_${targetId}`)
          .setLabel("Sessions(s)")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`cohost_${targetId}`)
          .setLabel("Cohost(s)")
          .setStyle(ButtonStyle.Danger)
      );

      return interaction.reply({ embeds: [embed], components: [row] });

    } catch (err) {
      console.error(err);
      if (!interaction.replied)
        await interaction.reply({ content: "An error occurred while fetching the staff profile.", ephemeral: true });
    }
  }
};
