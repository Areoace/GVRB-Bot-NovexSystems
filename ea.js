const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const Settings = require("../../models/settings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ea")
    .setDescription("Sends out early access")
    .addStringOption(option =>
      option.setName('link')
        .setDescription('The link for early access')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const { guild, user, member } = interaction;
      const guildId = guild.id;
      const userId = user.id;
      const sessionLink = interaction.options.getString('link');

      const settings = await Settings.findOne({ guildId });
      if (!settings) return interaction.reply({ content: 'Server settings not configured.', ephemeral: true });

      const staffRoles = settings.staffRoleIds || [];
      const eaRoles = settings.eaRoleIds || [];

      if (staffRoles.length === 0) return interaction.reply({ content: 'Staff roles not set up.', ephemeral: true });
      if (eaRoles.length === 0) return interaction.reply({ content: 'EA roles not set up.', ephemeral: true });

      const hasStaffRole = staffRoles.some(id => member.roles.cache.has(id));
      const hasEaRole = eaRoles.some(id => member.roles.cache.has(id));

      if (!hasStaffRole && !hasEaRole) {
        return interaction.reply({ content: 'You must react to the startup session first.', ephemeral: true });
      }

      const embedTitle = settings.eaEmbed?.title || "EA Embed Not Configured";
      const embedDescription = (settings.eaEmbed?.description || "Embed Format is not set, please use /settings and setup the embed format.").replace(/{user}/gi, `<@${userId}>`);
      const embedColor = settings.embedcolor || '#2b2d31';
      const embedImage = settings.eaEmbed?.image || null;

      const embed = new EmbedBuilder()
        .setTitle(embedTitle)
        .setDescription(embedDescription)
        .setColor(embedColor);

      if (embedImage) embed.setImage(embedImage);

      const button = new ButtonBuilder()
        .setLabel('Session Link')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`ea_link_${userId}`);

      const row = new ActionRowBuilder().addComponents(button);

      const pingRoles = eaRoles.slice(0, 4).map(id => `<@&${id}>`).join(' ');

      const sessionMessage = await interaction.channel.send({
        content: pingRoles,
        embeds: [embed],
        components: [row]
      });

      sessionMessage.sessionLink = sessionLink;

      if (settings.logChannelId) {
        const logChannel = guild.channels.cache.get(settings.logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle("EA Link Set")
            .addFields(
              { name: "User", value: `<@${userId}>` },
              { name: "Link Set", value: sessionLink }
            )
            .setColor(embedColor)
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      }

      await interaction.reply({ content: 'EA session sent successfully!', ephemeral: true });

    } catch (err) {
      console.error(err);
      if (!interaction.replied) interaction.reply({ content: 'Error executing command.', ephemeral: true });
    }
  }
};
