const Settings = require('../models/settings');
const Warrant = require('../models/warrant');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== 'delete_warrant_select') return;

    const settings = await Settings.findOne({ guildId: interaction.guild.id });
    const color = settings?.embedcolor || '#d22b2b';

    const warrantId = interaction.values[0];
    const warrant = await Warrant.findById(warrantId);

    if (!warrant)
      return interaction.reply({ content: 'Warrant not found.', ephemeral: true });

    await Warrant.findByIdAndDelete(warrantId);

    await interaction.reply({
      content: 'Warrant deleted successfully.',
      ephemeral: true
    });
  }
};
