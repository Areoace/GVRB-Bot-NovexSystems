const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Settings = require("../../models/settings");

global.sessionMemory = global.sessionMemory || {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cohost")
    .setDescription("Post the cohost embed under the startup embed."),

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

      const cohostEmbed = settings.cohostEmbed || {};
      if (!cohostEmbed.title || !cohostEmbed.description)
        return interaction.reply({ content: "Cohost embed not set in settings.", ephemeral: true });

      const referencedMessage = interaction.targetMessage || interaction.options.get("message")?.message;
      const replyTarget = referencedMessage || interaction.message || interaction.channel.lastMessage;
      if (!replyTarget)
        return interaction.reply({ content: "No message found to reply to.", ephemeral: true });

      await interaction.deferReply({ ephemeral: true });

      const description = cohostEmbed.description.replace(/\$user|\{user\}/g, `<@${userId}>`);

      const embed = new EmbedBuilder()
        .setTitle(cohostEmbed.title)
        .setDescription(description)
        .setColor(settings.embedcolor || "#2b2d31");

      if (cohostEmbed.image) embed.setImage(cohostEmbed.image);

      await replyTarget.reply({ embeds: [embed] });

      if (settings.logChannelId) {
        const logChannel = guild.channels.cache.get(settings.logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle("Cohost Sent")
            .setDescription(`User: <@${userId}>`)
            .setColor(settings.embedcolor || "#2b2d31")
            .setTimestamp();
          logChannel.send({ embeds: [logEmbed] }).catch(() => {});
        }
      }

      global.sessionMemory[guildId] = {
        cohostUserId: userId,
        cohostTimestamp: Date.now()
      };

      await interaction.followUp({ content: "Cohost embed sent.", ephemeral: true });

    } catch {
      if (!interaction.replied)
        await interaction.reply({ content: "An error occurred.", ephemeral: true });
    }
  }
};
