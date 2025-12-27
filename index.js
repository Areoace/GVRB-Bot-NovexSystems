require("dotenv").config();
const { Client, Collection, GatewayIntentBits, Partials, REST, Routes } = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");
const { token, dbtoken } = process.env;

mongoose.connect(dbtoken)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB Error:", err.message));


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
});

client.commands = new Collection();
client.commandArray = [];


const handleEvents = async () => {
  const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
  for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
};


const handleCommands = async () => {
  const commandFiles = fs.readdirSync("./commands/slash")
    .filter(file => file.endsWith(".js") && file !== "sessionstore.js");

  for (const file of commandFiles) {
    const command = require(`./commands/slash/${file}`);
    client.commands.set(command.data.name, command);
    client.commandArray.push(command.data.toJSON());
  }
};




const clientId = "1446856618556915946";
const guildId = "1312267385784242286";
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    await handleCommands();

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: client.commandArray }
    );
    console.log("Slash commands registered.");
  } catch (err) {
    console.error("Error registering commands:", err);
  }
})();


(async () => {
  await handleEvents();
})();

client.login(token);