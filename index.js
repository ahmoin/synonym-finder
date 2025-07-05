const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

require("dotenv").config();
const token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const joinFile = path.join(__dirname, "find.js");
const joinCommand = require(joinFile);
if ("data" in joinCommand && "execute" in joinCommand) {
  client.commands.set(joinCommand.data.name, joinCommand);
}

const interactionCreateFile = path.join(__dirname, "interactionCreate.js");
const interactionCreateEvent = require(interactionCreateFile);
client.on(interactionCreateEvent.name, (...args) =>
  interactionCreateEvent.execute(...args),
);

client.login(token);
