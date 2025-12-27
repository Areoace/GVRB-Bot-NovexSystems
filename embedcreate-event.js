const { Events, EmbedBuilder, Colors } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;
        if (interaction.customId !== 'embedCreateModal') return;

        const title = interaction.fields.getTextInputValue('embedTitle');
        const description = interaction.fields.getTextInputValue('embedDescription');
        const image = interaction.fields.getTextInputValue('embedImage');
        const color = interaction.fields.getTextInputValue('embedColor');

        const embedColor = color && /^#?[0-9A-F]{6}$/i.test(color)
            ? `#${color.replace('#', '')}`
            : Colors.White;

        const embed = new EmbedBuilder()
            .setDescription(description)
            .setColor(embedColor);

        if (title) embed.setTitle(title);
        if (image) embed.setImage(image);


        await interaction.deferUpdate();


        await interaction.channel.send({ embeds: [embed] });
    },
};
