const { REST, Routes } = require("discord.js");
const path = require("node:path");

require("dotenv").config();
const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_TOKEN;

const commands = [];

const joinFile = path.join(__dirname, "find.js");
const joinCommand = require(joinFile);
if ("data" in joinCommand && "execute" in joinCommand) {
  commands.push(joinCommand.data.toJSON());
}

const rest = new REST().setToken(token);

(async () => {
  await rest.put(Routes.applicationCommands(clientId), {
    body: commands,
  });
})();
