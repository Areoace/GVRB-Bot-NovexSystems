const { Events, EmbedBuilder } = require("discord.js");
const Settings = require("../models/settings");
const SessionLog = require("../models/sessionlog");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const [type, userId] = interaction.customId.split("_");
    if (!["session", "cohost"].includes(type)) return;

    if (interaction.replied || interaction.deferred) {
      return;
    }

    await interaction.deferReply({ flags: 64 });

    try {
      const guildId = interaction.guild.id;

      const settings = await Settings.findOne({ guildId });
      const color = settings?.embedcolor || "#2b2d31";

      const logs = await SessionLog.find({ guildId, userId, type }).sort({ start: -1 });

      let lines = [];
      let index = 1;

      for (const log of logs) {
        const start = `<t:${Math.floor(log.start / 1000)}>`;
        const end = log.end ? `<t:${Math.floor(log.end / 1000)}>` : "Active";
        const duration = log.duration || "N/A";

        lines.push(`${index}. ${start} - ${end} - ${duration}`);
        index++;
      }

      if (!lines.length) lines.push("No logs found.");

      const embed = new EmbedBuilder()
        .setTitle(`${type === "session" ? "Session Logs" : "Cohost Logs"}`)
        .setDescription(lines.join("\n"))
        .setColor(color)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error handling button interaction:", error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: "An error occurred while processing your request.", flags: 64 });
      } else if (interaction.deferred) {
        await interaction.editReply({ content: "An error occurred while processing your request." });
      }
    }
  }
};