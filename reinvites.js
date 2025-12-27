const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const Settings = require("../../models/settings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reinvites")
    .setDescription("Releases reinvites.")
    .addStringOption(option =>
      option.setName('link')
        .setDescription('The link for reinvites')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const { guild, member, user } = interaction;
      const guildId = guild.id;
      const userId = user.id;
      const sessionLink = interaction.options.getString('link');

      const settings = await Settings.findOne({ guildId });
      if (!settings) return interaction.reply({ content: "Server settings not configured.", ephemeral: true });

      const staffRoles = settings.staffRoleIds || [];
      if (!staffRoles.length) return interaction.reply({ content: "Staff roles not set.", ephemeral: true });

      const hasStaffRole = staffRoles.some(id => member.roles.cache.has(id));
      if (!hasStaffRole) return interaction.reply({ content: "You do not have the required staff role.", ephemeral: true });

      const reinvitesEmbed = settings.reinvitesEmbed || {};
      if (!reinvitesEmbed.title || !reinvitesEmbed.description)
        return interaction.reply({ content: "Reinvites embed not set in settings.", ephemeral: true });

      const civRoles = (settings.civiRoleIds || []).filter(id => guild.roles.cache.has(id));
      if (!civRoles.length)
        return interaction.reply({ content: "No valid civilian roles set.", ephemeral: true });

      await interaction.deferReply({ ephemeral: true });

      const title = reinvitesEmbed.title.replace(/\$user/g, `<@${userId}>`);
      const description = reinvitesEmbed.description.replace(/\$user/g, `<@${userId}>`);
      const image = reinvitesEmbed.image ? reinvitesEmbed.image.replace(/\$user/g, `<@${userId}>`) : null;

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(settings.embedcolor || "#2b2d31");

      if (image) embed.setImage(image);

      const button = new ButtonBuilder()
        .setCustomId(`session_link_${userId}`)
        .setLabel("Session Link")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(button);

      const sessionMessage = await interaction.channel.send({
        content: civRoles.map(r => `<@&${r}>`).join(" "),
        embeds: [embed],
        components: [row]
      });

      sessionMessage.sessionLink = sessionLink;

      if (settings.logChannelId) {
        const logChannel = guild.channels.cache.get(settings.logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle("Reinvites Sent")
            .addFields(
              { name: "User", value: `<@${userId}>` },
              { name: "Link", value: sessionLink }
            )
            .setColor(settings.embedcolor || "#2b2d31")
            .setTimestamp();

          logChannel.send({ embeds: [logEmbed] }).catch(() => {});
        }
      }

      await interaction.followUp({ content: "Reinvites session embed sent successfully.", ephemeral: true });

    } catch (err) {
      console.error(err);
      if (!interaction.replied)
        await interaction.followUp({ content: "An error occurred.", ephemeral: true });
    }
  }
};
