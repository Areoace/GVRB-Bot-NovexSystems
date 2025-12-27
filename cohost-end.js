const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Settings = require("../../models/settings");
const SessionLog = require("../../models/sessionlog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cohostend")
    .setDescription("Ends the cohost and replies to the cohost embed."),

  async execute(interaction) {
    try {
      const { guild, member, user } = interaction;
      const guildId = guild.id;
      const userId = user.id;

      const settings = await Settings.findOne({ guildId });
      if (!settings) return interaction.reply({ content: "Server settings not configured.", ephemeral: true });

      const staffRoles = settings.staffRoleIds || [];
      if (!staffRoles.length) return interaction.reply({ content: "Staff roles not set.", ephemeral: true });

      const hasStaffRole = staffRoles.some(id => member.roles.cache.has(id));
      if (!hasStaffRole) return interaction.reply({ content: "You do not have permission.", ephemeral: true });

      const endEmbed = settings.cohostendEmbed || {};
      if (!endEmbed.title || !endEmbed.description)
        return interaction.reply({ content: "Cohost end embed not set.", ephemeral: true });

      const replyTarget = interaction.targetMessage || interaction.message?.reference?.messageId
        ? await interaction.channel.messages.fetch(interaction.message.reference?.messageId)
        : interaction.channel.lastMessage;

      if (!replyTarget)
        return interaction.reply({ content: "No cohost message found to reply to.", ephemeral: true });

      await interaction.deferReply({ ephemeral: true });

      const description = endEmbed.description.replace(/\$user|\{user\}/g, `<@${userId}>`);

      const embed = new EmbedBuilder()
        .setTitle(endEmbed.title)
        .setDescription(description)
        .setColor(settings.embedcolor || "#2b2d31");

      if (endEmbed.image) embed.setImage(endEmbed.image);

      await replyTarget.reply({ embeds: [embed] });

      if (settings.logChannelId) {
        const logChannel = guild.channels.cache.get(settings.logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle("Cohost End Sent")
            .setDescription(`User: <@${userId}>`)
            .setColor(settings.embedcolor || "#2b2d31")
            .setTimestamp();
          logChannel.send({ embeds: [logEmbed] }).catch(() => {});
        }
      }

      const memory = global.sessionMemory[guildId] || {};
      const startTime = memory.cohostTimestamp || Date.now();

      await SessionLog.create({
        guildId,
        userId,
        type: "cohost",
        startTime,
        endTime: Date.now()
      });

      await interaction.followUp({ content: "Cohost end embed sent.", ephemeral: true });

    } catch {
      if (!interaction.replied)
        await interaction.reply({ content: "An error occurred.", ephemeral: true });
    }
  }
};
