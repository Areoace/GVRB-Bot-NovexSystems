const { Events, EmbedBuilder } = require('discord.js');
const Settings = require('../models/settings');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      const data = await Settings.findOne({ guildId: member.guild.id });
      if (!data) return;
      if (!data.welcomechannelid) return;
      if (!data.welcomeEmbed || !data.welcomeEmbed.title || !data.welcomeEmbed.description) return;

      const channel = member.guild.channels.cache.get(data.welcomechannelid);
      if (!channel) return;

      const desc = data.welcomeEmbed.description.replace(/\$user/g, `<@${member.id}>`);
      const title = data.welcomeEmbed.title.replace(/\$user/g, `<@${member.id}>`);

      const embed = new EmbedBuilder()
        .setColor(data.embedcolor || '#d22b2b')
        .setTitle(title)
        .setDescription(desc);

      if (data.welcomeEmbed.image) embed.setImage(data.welcomeEmbed.image);

      channel.send({ embeds: [embed], content: `<@${member.id}>` });
    } catch (e) {
      console.error(e);
    }
  }
};
