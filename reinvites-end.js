const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Settings = require("../../models/settings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reinvites-end")
    .setDescription("Ends the reinvites session."),

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

      const hasStaffRole = staffRoles.some(id => member.roles.cache.has(id));
      if (!hasStaffRole)
        return interaction.reply({ content: "You do not have permission to use this.", ephemeral: true });

      const reinvitesEndEmbed = settings.reinvitesendEmbed || {};
      if (!reinvitesEndEmbed.title || !reinvitesEndEmbed.description)
        return interaction.reply({ content: "Reinvites end embed not set in settings.", ephemeral: true });


      const messages = await interaction.channel.messages.fetch({ limit: 5 }).catch(() => null);
      if (!messages)
        return interaction.reply({ content: "Could not fetch messages.", ephemeral: true });

      const targetMsg = messages.find(msg =>
        msg.embeds?.length &&
        msg.embeds[0].title === settings.reinvitesEmbed?.title
      );

      if (!targetMsg)
        return interaction.reply({
          content: "No active reinvites embed found to reply to.",
          ephemeral: true
        });


      const endEmbed = new EmbedBuilder()
        .setTitle(reinvitesEndEmbed.title)
        .setDescription(reinvitesEndEmbed.description)
        .setColor(settings.embedcolor || "#2b2d31");

      if (reinvitesEndEmbed.image) endEmbed.setImage(reinvitesEndEmbed.image);

      await targetMsg.reply({ embeds: [endEmbed] });

      return interaction.reply({
        content: "Reinvites end embed sent.",
        ephemeral: true
      });

    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "An error occurred.",
        ephemeral: true
      });
    }
  }
};
