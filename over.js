const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Settings = require("../../models/settings");
const SessionLog = require("../../models/sessionlog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("over")
    .setDescription("Concludes the session."),

  async execute(interaction) {
    try {
      const { guild, member } = interaction;
      const guildId = guild.id;

      const settings = await Settings.findOne({ guildId });
      if (!settings)
        return interaction.reply({ content: "Server settings not configured.", ephemeral: true });

      const staffRoles = settings.staffRoleIds || [];
      if (!staffRoles.length)
        return interaction.reply({ content: "Staff roles not set.", ephemeral: true });

      const hasStaff = staffRoles.some(id => member.roles.cache.has(id));
      if (!hasStaff)
        return interaction.reply({ content: "You do not have permission to use this.", ephemeral: true });

      const overEmbed = settings.overEmbed || {};
      if (!overEmbed.title || !overEmbed.description)
        return interaction.reply({ content: "Over embed not set in settings.", ephemeral: true });

      await interaction.deferReply({ ephemeral: true });

      const messages = await interaction.channel.messages.fetch({ limit: 5 }).catch(() => null);
      if (!messages)
        return interaction.followUp({ content: "Could not fetch messages.", ephemeral: true });

      const targetMsg = messages.find(msg =>
        msg.embeds?.length &&
        msg.embeds[0].title === settings.startupEmbed?.title
      );

      if (!targetMsg)
        return interaction.followUp({
          content: "No startup embed found to reply to.",
          ephemeral: true
        });

      const embed = new EmbedBuilder()
        .setTitle(overEmbed.title)
        .setDescription(overEmbed.description)
        .setColor(settings.embedcolor || "#2b2d31");

      if (overEmbed.image) embed.setImage(overEmbed.image);

      await targetMsg.reply({ embeds: [embed] });

      const memory = global.sessionMemory[guildId] || {};
      const userId = memory.userId || interaction.user.id;
      const startTime = memory.startTimestamp || null;
      const endTime = Date.now();

      await SessionLog.create({
        guildId,
        userId,
        type: "session",
        startTime,
        endTime
      });

      return interaction.followUp({
        content: "Session concluded successfully.",
        ephemeral: true
      });

    } catch {
      if (!interaction.replied)
        return interaction.followUp({ content: "An error occurred.", ephemeral: true });
    }
  },
};
