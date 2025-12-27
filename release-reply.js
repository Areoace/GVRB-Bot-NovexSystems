const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    if (!customId.startsWith("session_link_")) return;

    const message = interaction.message;
    const sessionLink = message.sessionLink;

    if (!sessionLink) {
      return interaction.reply({ content: "No session link found.", ephemeral: true });
    }

    await interaction.reply({ content: `Link: ${sessionLink}`, ephemeral: true });
  }
};
