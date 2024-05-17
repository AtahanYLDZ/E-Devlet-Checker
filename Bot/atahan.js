const config = require('./Settings/config');
const glob = require('glob');
const fs = require("node:fs");
const { Client, Collection, Partials, ActivityType } = require('discord.js');
const client = new Client({ 
    intents: [3276799],
    partials: [Partials.User, Partials.Channel],
    presence: { activities: [{ name: "E-Devlet Bot", type: ActivityType.Playing }], status: "dnd" }
});
client.login(config.token);

client.slashCommands = new Collection();
client.globalCommands = [];

const commandFiles = fs.readdirSync("./Bot/Commands/SlashCommands").filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./Commands/SlashCommands/${file}`);
  client.slashCommands.set(command.name, command);
  client.globalCommands.push(command.commandData);
}

const eventFiles = fs.readdirSync("./Bot/Events").filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./Events/${file}`);
  client.on(event.name, event.execute);
}