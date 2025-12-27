const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');
const Settings = require('../models/settings');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      if (interaction.isStringSelectMenu()) {
        const settings =
          (await Settings.findOne({ guildId: interaction.guild.id })) ||
          new Settings({ guildId: interaction.guild.id });

        const color = settings.embedcolor || '#d22b2b';

        if (interaction.customId === 'settings_menu') {
          const choice = interaction.values[0];

          if (choice === 'embed') {
            const embed = new EmbedBuilder()
              .setTitle('Embed Settings')
              .setDescription('Choose an embed to edit or change embed color.')
              .setColor(color);

            const menu = new StringSelectMenuBuilder()
              .setCustomId('settings_embed_menu')
              .setPlaceholder('Choose an embed option')
              .addOptions([
                { label: 'Startup', value: 'startup' },
                { label: 'Profile', value: 'profile' },
                { label: 'EA', value: 'ea' },
                { label: 'Welcome', value: 'welcome' },
                { label: 'Ticket Support' , value: 'ticketsupport' },
                { label: 'Cohost', value: 'cohost' },
                { label: 'Cohost End', value: 'cohostend' },
                { label: 'Setup', value: 'setup' },
                { label: 'Release', value: 'release' },
                { label: 'Reinvites', value: 'reinvites' },
                { label: 'Reinvites Send', value: 'reinvitesend' },
                { label: 'Over', value: 'over' },
                { label: 'Cancel', value: 'cancel' },
                { label: 'Embed Color', value: 'color' }
              ]);

            return await interaction.reply({
              embeds: [embed],
              components: [new ActionRowBuilder().addComponents(menu)],
              ephemeral: true
            });
          }

          if (choice === 'role') {
            const embed = new EmbedBuilder()
              .setTitle('Role Settings')
              .setDescription('Choose which role group to configure.')
              .setColor(color);

            const menu = new StringSelectMenuBuilder()
              .setCustomId('settings_role_menu')
              .setPlaceholder('Choose a role section')
              .addOptions([
                { label: 'LEO', value: 'leo' },
                { label: 'Civilian', value: 'civi' },
                { label: 'EA', value: 'ea' },
                { label: 'Staff', value: 'staff' },
                { label: 'Admin', value: 'admin' }
              ]);

            return await interaction.reply({
              embeds: [embed],
              components: [new ActionRowBuilder().addComponents(menu)],
              ephemeral: true
            });
          }

          if (choice === 'vehiclecap') {
            const modal = new ModalBuilder()
              .setCustomId('vehiclecap_modal')
              .setTitle('Vehicle Cap');

            const roleInput = new TextInputBuilder()
              .setCustomId('vc_roleId')
              .setLabel('Role ID')
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            const capInput = new TextInputBuilder()
              .setCustomId('vc_cap')
              .setLabel('Vehicle Amount')
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            modal.addComponents(
              new ActionRowBuilder().addComponents(roleInput),
              new ActionRowBuilder().addComponents(capInput)
            );

            return await interaction.showModal(modal);
          }

          if (choice === 'logging') {
            const embed = new EmbedBuilder()
              .setTitle('Logging Settings')
              .setDescription('Choose which channel id to set for logging.')
              .setColor(color);

            const menu = new StringSelectMenuBuilder()
              .setCustomId('settings_logging_menu')
              .setPlaceholder('Choose a logging option')
              .addOptions([
                { label: 'Welcome Channel ID', value: 'welcomechannel' },
                { label: 'Log Channel ID', value: 'logchannel' }
              ]);

            return await interaction.reply({
              embeds: [embed],
              components: [new ActionRowBuilder().addComponents(menu)],
              ephemeral: true
            });
          }
        }

        if (interaction.customId === 'settings_embed_menu') {
          const key = interaction.values[0];

          if (key === 'color') {
            const modal = new ModalBuilder()
              .setCustomId('embed_color_modal')
              .setTitle('Embed Color');

            const colorInput = new TextInputBuilder()
              .setCustomId('color_hex')
              .setLabel('Hex (#RRGGBB)')
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(colorInput));

            return await interaction.showModal(modal);
          }

          const modal = new ModalBuilder()
            .setCustomId(`embed_modal:${key}`)
            .setTitle(`Edit ${key} Embed`);

          const titleInput = new TextInputBuilder()
            .setCustomId('embed_title')
            .setLabel('Title')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

          const descInput = new TextInputBuilder()
            .setCustomId('embed_desc')
            .setLabel('Description')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

          const imageInput = new TextInputBuilder()
            .setCustomId('embed_image')
            .setLabel('Image URL')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

          modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(imageInput)
          );

          return await interaction.showModal(modal);
        }

        if (interaction.customId === 'settings_role_menu') {
          const section = interaction.values[0];

          const modal = new ModalBuilder()
            .setCustomId(`roles_modal:${section}`)
            .setTitle(`Configure ${section} Roles`);

          const r1 = new TextInputBuilder()
            .setCustomId('role1')
            .setLabel('Role ID 1')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const r2 = new TextInputBuilder()
            .setCustomId('role2')
            .setLabel('Role ID 2')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

          const r3 = new TextInputBuilder()
            .setCustomId('role3')
            .setLabel('Role ID 3')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

          const r4 = new TextInputBuilder()
            .setCustomId('role4')
            .setLabel('Role ID 4')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

          modal.addComponents(
            new ActionRowBuilder().addComponents(r1),
            new ActionRowBuilder().addComponents(r2),
            new ActionRowBuilder().addComponents(r3),
            new ActionRowBuilder().addComponents(r4)
          );

          return await interaction.showModal(modal);
        }

        if (interaction.customId === 'settings_logging_menu') {
          const choice = interaction.values[0];

          const modal = new ModalBuilder()
            .setCustomId(`logging_modal:${choice}`)
            .setTitle(`Set ${choice}`);

          const channelInput = new TextInputBuilder()
            .setCustomId('channel_id')
            .setLabel('Channel ID')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          modal.addComponents(new ActionRowBuilder().addComponents(channelInput));

          return await interaction.showModal(modal);
        }
      }

      if (interaction.isModalSubmit()) {
        let settings =
          (await Settings.findOne({ guildId: interaction.guild.id })) ||
          new Settings({ guildId: interaction.guild.id });

        const color = settings.embedcolor || '#d22b2b';

        if (interaction.customId.startsWith('embed_modal:')) {
          const key = interaction.customId.split(':')[1];
          const title = interaction.fields.getTextInputValue('embed_title');
          const desc = interaction.fields.getTextInputValue('embed_desc');
          const image = interaction.fields.getTextInputValue('embed_image');

          settings[`${key}Embed`] = {
            title: title || '',
            description: desc || '',
            image: image || ''
          };

          await settings.save();

          const embed = new EmbedBuilder()
            .setTitle('Saved')
            .setDescription(`Saved ${key} embed.`)
            .setColor(color);

          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (interaction.customId === 'embed_color_modal') {
          const hex = interaction.fields.getTextInputValue('color_hex').replace('#', '');

          if (!/^([0-9A-F]{6})$/i.test(hex)) {
            const embed = new EmbedBuilder()
              .setTitle('Invalid')
              .setDescription('Invalid hex format.')
              .setColor('#ff0000');

            return await interaction.reply({ embeds: [embed], ephemeral: true });
          }

          settings.embedcolor = `#${hex}`;
          await settings.save();

          const embed = new EmbedBuilder()
            .setTitle('Saved')
            .setDescription(`Embed color updated.`)
            .setColor(settings.embedcolor);

          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (interaction.customId === 'vehiclecap_modal') {
          const roleId = interaction.fields.getTextInputValue('vc_roleId');
          const cap = Number(interaction.fields.getTextInputValue('vc_cap'));

          if (isNaN(cap)) {
            const embed = new EmbedBuilder()
              .setTitle('Invalid')
              .setDescription('Vehicle cap must be a number.')
              .setColor('#ff0000');

            return await interaction.reply({ embeds: [embed], ephemeral: true });
          }

          settings.vehicleCaps = settings.vehicleCaps || [];
          const existing = settings.vehicleCaps.find(v => v.roleId === roleId);

          if (existing) existing.cap = cap;
          else settings.vehicleCaps.push({ roleId, cap });

          await settings.save();

          const embed = new EmbedBuilder()
            .setTitle('Saved')
            .setDescription(`Vehicle cap saved for <@&${roleId}>.`)
            .setColor(color);

          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (interaction.customId.startsWith('roles_modal:')) {
          const section = interaction.customId.split(':')[1];

          const arr = [
            interaction.fields.getTextInputValue('role1'),
            interaction.fields.getTextInputValue('role2') || '',
            interaction.fields.getTextInputValue('role3') || '',
            interaction.fields.getTextInputValue('role4') || ''
          ].filter(Boolean);

          if (section === 'leo') settings.leoRoleIds = arr;
          if (section === 'civi') settings.civiRoleIds = arr;
          if (section === 'ea') settings.eaRoleIds = arr;
          if (section === 'staff') settings.staffRoleIds = arr;
          if (section === 'admin') settings.adminRoleIds = arr;

          await settings.save();

          const embed = new EmbedBuilder()
            .setTitle('Saved')
            .setDescription(`Saved ${section} role IDs.`)
            .setColor(color);

          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (interaction.customId.startsWith('logging_modal:')) {
          const key = interaction.customId.split(':')[1];
          const channelId = interaction.fields.getTextInputValue('channel_id');

          if (key === 'welcomechannel') settings.welcomechannelid = channelId;
          if (key === 'logchannel') settings.logChannelId = channelId;

          await settings.save();

          const embed = new EmbedBuilder()
            .setTitle('Saved')
            .setDescription(`Saved ${key} to <#${channelId}>.`)
            .setColor(color);

          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
    } catch (err) {
      console.error('Settings interaction error:', err);
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'An error occurred.', ephemeral: true });
        } else {
          await interaction.reply({ content: 'An error occurred.', ephemeral: true });
        }
      } catch {}
    }
  }
};
