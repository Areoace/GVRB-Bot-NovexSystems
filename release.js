const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const Settings = require("../../models/settings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("release")
    .setDescription("Release the session.")
    .addStringOption(option =>
      option.setName('link')
        .setDescription('The link for the session.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('frp-limit')
        .setDescription('The FRP limit for the session.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('peacetimestatus')
        .setDescription('Peacetime Status')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('ps-status')
        .setDescription('Public Services Status')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const { guild, member, user } = interaction;
      const guildId = guild.id;
      const userId = user.id;

      const sessionLink = interaction.options.getString('link');
      const frpLimit = interaction.options.getString('frp-limit');
      const ptStatus = interaction.options.getString('peacetimestatus');
      const psStatus = interaction.options.getString('ps-status');

      const settings = await Settings.findOne({ guildId });
      if (!settings) return interaction.reply({ content: "Server settings not configured.", ephemeral: true });

      const staffRoles = settings.staffRoleIds || [];
      if (staffRoles.length === 0) return interaction.reply({ content: "Staff roles not set.", ephemeral: true });

      const hasStaffRole = staffRoles.some(id => member.roles.cache.has(id));
      if (!hasStaffRole) return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });

      const releaseEmbed = settings.releaseEmbed || {};
      if (!releaseEmbed.title || !releaseEmbed.description)
        return interaction.reply({ content: "Release embed not set in settings.", ephemeral: true });

      const civRoles = (settings.civiRoleIds || []).filter(id => guild.roles.cache.has(id));
      if (civRoles.length === 0)
        return interaction.reply({ content: "No valid civilian roles found.", ephemeral: true });

      await interaction.deferReply({ ephemeral: true });

      let description = releaseEmbed.description
        .replace(/\$user/g, `<@${userId}>`)
        .replace(/\$frp/g, frpLimit)
        .replace(/\$pt/g, ptStatus)
        .replace(/\$ps/g, psStatus);

      const embed = new EmbedBuilder()
        .setTitle(releaseEmbed.title)
        .setDescription(description)
        .setColor(settings.embedcolor || "#2b2d31");

      if (releaseEmbed.image) embed.setImage(releaseEmbed.image);

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
            .setTitle("Release Sent")
            .addFields(
              { name: "User", value: `<@${userId}>` },
              { name: "Link", value: sessionLink },
              { name: "FRP Limit", value: frpLimit },
              { name: "Peacetime", value: ptStatus },
              { name: "Public Services", value: psStatus }
            )
            .setColor(settings.embedcolor || "#2b2d31")
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      }

      await interaction.followUp({ content: "Release session embed sent successfully.", ephemeral: true });

    } catch (err) {
      console.error(err);
      if (!interaction.replied)
        await interaction.followUp({ content: "An error occurred while processing your request.", ephemeral: true });
    }
  }
};
