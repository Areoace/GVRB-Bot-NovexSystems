const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embedcreate')
        .setDescription('Create a custom embed via modal')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId('embedCreateModal')
            .setTitle('Embed Creator');

        const titleInput = new TextInputBuilder()
            .setCustomId('embedTitle')
            .setLabel('Embed Title (optional)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('embedDescription')
            .setLabel('Embed Description (required)')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const imageInput = new TextInputBuilder()
            .setCustomId('embedImage')
            .setLabel('Embed Image URL (optional)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const colorInput = new TextInputBuilder()
            .setCustomId('embedColor')
            .setLabel('Embed Color (hex, optional)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descriptionInput),
            new ActionRowBuilder().addComponents(imageInput),
            new ActionRowBuilder().addComponents(colorInput),
        );

        await interaction.showModal(modal);
    },
};
