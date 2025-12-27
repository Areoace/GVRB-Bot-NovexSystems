const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const Vehicle = require('../models/vehicle')
const Ticket = require('../models/ticket')
const Warrant = require('../models/warrant')
const Settings = require('../models/settings')

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return

    const guildId = interaction.guild.id
    const customId = interaction.customId
    const settings = await Settings.findOne({ guildId })
    const embedColor = settings?.embedcolor || 0x2b2d31

    if (customId.startsWith('registrations_')) {
      const parts = customId.split('_')
      const targetId = parts[1]
      const page = parseInt(parts[2].replace('page','')) || 0

      const vehicles = await Vehicle.find({ guildId, userId: targetId })
      const perPage = 5
      const start = page * perPage
      const end = start + perPage
      const slice = vehicles.slice(start, end)

      const desc = slice.map((v, i) =>
        `${start + i + 1}. ${v.year} ${v.brand} ${v.model}, ${v.color} - ${v.numberPlate}`
      ).join('\n') || 'No vehicles found.'

      const embed = new EmbedBuilder()
        .setTitle('Vehicle Registrations')
        .setDescription(desc)
        .setColor(embedColor)

      const row = new ActionRowBuilder()
      if (vehicles.length > perPage) {
        if (page > 0) {
          row.addComponents(new ButtonBuilder().setCustomId(`registrations_${targetId}_page${page-1}`).setLabel('Previous').setStyle(ButtonStyle.Secondary))
        }
        if (end < vehicles.length) {
          row.addComponents(new ButtonBuilder().setCustomId(`registrations_${targetId}_page${page+1}`).setLabel('Next').setStyle(ButtonStyle.Primary))
        }
      }

      return interaction.reply({ embeds: [embed], components: row.components.length ? [row] : [], ephemeral: true })
    }

    if (customId.startsWith('service_records_')) {
      const targetId = customId.split('_')[2]

      const tickets = await Ticket.find({ guildId, targetId })
      const warrants = await Warrant.find({ guildId, targetId })

      const ticketLines = tickets.map((t, i) =>
        `${i+1}. ${t.offense} - $${t.price}\n> Officer : <@${t.userId}>`
      ).join('\n')

      const warrantLines = warrants.map((w, i) =>
        `${i+1}. ${w.offense}\n> Officer : <@${w.userId}>`
      ).join('\n')

      let desc = ''
      if (ticketLines) desc += `**Tickets**\n${ticketLines}\n\n`
      if (warrantLines) desc += `**Warrants**\n${warrantLines}`
      if (!desc) desc = 'No service records found.'

      const embed = new EmbedBuilder()
        .setTitle('Service Records')
        .setDescription(desc)
        .setColor(embedColor)

      return interaction.reply({ embeds: [embed], ephemeral: true })
    }
  }
}