const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const Settings = require('../../models/settings');
const Vehicle = require('../../models/vehicle');
const License = require('../../models/license');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View a user profile')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to view profile')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {

      await interaction.deferReply({ ephemeral: false });

      const guild = interaction.guild;
      const guildId = guild.id;
      const target = interaction.options.getUser('user') || interaction.user;
      const targetId = target.id;

      const settings = await Settings.findOne({ guildId });
      const civRoles = settings?.civiRoleIds || [];
      const color = settings?.embedcolor || '#2b2d31';
      const format = settings?.profileEmbed || {};
      const apiKey = '1bcf93af-f2d9-4115-9f6a-4b473e421a48';

      const hasCiv = interaction.member.roles.cache.some(r => civRoles.includes(r.id));
      if (!hasCiv) {
        return interaction.editReply({ content: 'You do not have the Civilian role.', flags: MessageFlags.Ephemeral });
      }

      const vehicles = await Vehicle.find({ guildId, userId: targetId });
      let license = await License.findOne({ guildId, userId: targetId });

      if (!license) {
        license = new License({
          guildId,
          userId: targetId,
          status: 'Active'
        });
        await license.save();
      }

      let robloxData = {};
      try {
        const res = await axios.get(`https://api.blox.link/v4/public/guilds/${guild.id}/discord-to-roblox/${targetId}`, {
          headers: { Authorization: apiKey }
        });

        if (res?.data?.robloxID) {
          const robloxID = res.data.robloxID;
          robloxData.profileLink = `https://www.roblox.com/users/${robloxID}/profile`;

          const [userInfo, avatar] = await Promise.all([
            axios.get(`https://users.roblox.com/v1/users/${robloxID}`),
            axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxID}&size=150x150&format=Png`)
          ]);

          robloxData.username = userInfo?.data?.name;
          robloxData.thumbnail = avatar?.data?.data?.[0]?.imageUrl;
        }
      } catch (err) {}

      const vehicleCount = vehicles.length;
      const robloxName = robloxData.username || 'Unknown';

 
      const replacedDescription = (format.description || `Embed Format is not set, please use /settings and setup the embed format.`)
        .replaceAll('$user', `<@${targetId}>`)
        .replaceAll('$username', target.username)
        .replaceAll('$roblox', robloxName)
        .replaceAll('$vehiclecount', vehicleCount.toString())
        .replaceAll('$license', license.status);

      const embed = new EmbedBuilder()
        .setTitle(format.title || `Profile`)
        .setDescription(replacedDescription)
        .setColor(color);

      if (robloxData.thumbnail) {
        embed.setThumbnail(robloxData.thumbnail);
      } else {
        embed.setThumbnail(target.displayAvatarURL());
      }

      if (format.image) embed.setImage(format.image);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`registrations_${targetId}_page0`)
          .setLabel('Registration(s)')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`service_records_${targetId}`)
          .setLabel('Service Record(s)')
          .setStyle(ButtonStyle.Danger)
      );

      return interaction.editReply({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error('Profile command error:', err);
      try {

        if (interaction.deferred || interaction.replied) {
          return interaction.editReply({ content: 'An error occurred while running this command.', flags: MessageFlags.Ephemeral });
        } else {

          return interaction.reply({ content: 'An error occurred while running this command.', flags: MessageFlags.Ephemeral });
        }
      } catch (e) {
        console.error('Failed to send error message:', e);
      }
    }
  }
};