const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Settings = require('../../models/settings');

let sessionMemory = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('startup')
    .setDescription('Start a session')
    .addStringOption(option =>
      option.setName('reaction')
        .setDescription('How many reactions are needed to start')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const guildId = interaction.guild.id;
      const userId = interaction.user.id;
      const reactionNeeded = parseInt(interaction.options.getString('reaction'));

      const settings = await Settings.findOne({ guildId });
      if (!settings) return interaction.reply({ content: 'Settings not setup', ephemeral: true });
      if (!settings.staffRoleIds?.length) return interaction.reply({ content: 'Staff Role not setup', ephemeral: true });

      const hasStaffRole = settings.staffRoleIds.some(id => interaction.member.roles.cache.has(id));
      if (!hasStaffRole) return interaction.reply({ content: 'You do not have a staff role.', ephemeral: true });

      if (!settings.startupEmbed?.title || !settings.startupEmbed?.description)
        return interaction.reply({ content: 'Startup embed not setup in settings.', ephemeral: true });

      if (!settings.civiRoleIds?.length)
        return interaction.reply({ content: 'Civilian role not setup.', ephemeral: true });

      const civRoleId = settings.civiRoleIds[0];

      await interaction.reply({ content: 'Command executed successfully', ephemeral: true });

      const description = settings.startupEmbed.description
        .replace(/\$reaction/g, reactionNeeded)
        .replace(/\$user/g, `<@${userId}>`);

      const mainEmbed = new EmbedBuilder()
        .setTitle(settings.startupEmbed.title)
        .setDescription(description)
        .setColor(settings.embedcolor || '#2b2d31');

      if (settings.startupEmbed.image) mainEmbed.setImage(settings.startupEmbed.image);

      const mainMessage = await interaction.channel.send({
        content: `<@&${civRoleId}>`,
        embeds: [mainEmbed]
      });

      await mainMessage.react('✅');

      sessionMemory[guildId] = {
        reactedUsers: new Set(),
        replyMessage: null,
        started: false,
        startupMessage: mainMessage,
        userId,
        timestamp: Date.now(),
        startTimestamp: null,
        messageId: mainMessage.id
      };

      const filter = (reaction, user) =>
        reaction.emoji.name === '✅' && !user.bot;

      const collector = mainMessage.createReactionCollector({ filter, dispose: true });

      collector.on('collect', async () => {
        const count = mainMessage.reactions.cache.get('✅')?.count || 0;

        if (!sessionMemory[guildId].started && count >= reactionNeeded + 1) {
          sessionMemory[guildId].started = true;
          sessionMemory[guildId].startTimestamp = Date.now();

          const setup = settings.setupEmbed;

          const setupDescription = setup.description
            ?.replace(/\$user/g, `<@${userId}>`) || `<@${userId}> is now setting up the session.`;

          const startedEmbed = new EmbedBuilder()
            .setTitle(setup.title || 'Setting Up')
            .setDescription(setupDescription)
            .setColor(settings.embedcolor || '#2b2d31');

          if (setup.image) startedEmbed.setImage(setup.image);

          const replyMsg = await mainMessage.reply({ embeds: [startedEmbed] });
          sessionMemory[guildId].replyMessage = replyMsg;
        }
      });

      collector.on('remove', async () => {
        const count = mainMessage.reactions.cache.get('✅')?.count || 0;

        if (sessionMemory[guildId].started && count < reactionNeeded + 1) {
          sessionMemory[guildId].started = false;
          sessionMemory[guildId].startTimestamp = null;

          if (sessionMemory[guildId].replyMessage) {
            await sessionMemory[guildId].replyMessage.delete().catch(() => {});
            sessionMemory[guildId].replyMessage = null;
          }
        }
      });

      collector.on('end', async () => {
        if (!sessionMemory[guildId].started && sessionMemory[guildId].replyMessage) {
          await sessionMemory[guildId].replyMessage.delete().catch(() => {});
        }
      });

    } catch {
      if (!interaction.replied) {
        await interaction.reply({ content: 'Error executing command.', ephemeral: true });
      }
    }
  }
};
