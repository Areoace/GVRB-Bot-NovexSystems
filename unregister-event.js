const Vehicle = require('../models/vehicle');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {
    if (!interaction.isAutocomplete()) return;
    if (interaction.commandName !== 'unregister') return;

    const vehicles = await Vehicle.find({
      guildId: interaction.guild.id,
      userId: interaction.user.id
    });

    const choices = vehicles.map(v => ({
      name: `${v.year} ${v.brand} ${v.model} (${v.numberPlate})`,
      value: v._id.toString()
    }));

    await interaction.respond(choices.slice(0, 25));
  }
};
