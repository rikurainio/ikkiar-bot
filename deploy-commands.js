// THIS SCRIPT IS USED TO DEPLOY YOUR COMMANDS
// MAKE SURE TO CHECK FILE PATHS!
require('dotenv').config()
const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = process.env.BOT_TOKEN
const clientId = process.env.CLIENT_ID
const guildId = process.env.DEV_SERVER_ID

// GET ALL COMMANDS FROM THEIR RESPECTIVE .JS FILES
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	console.log('<*> Added: ', command)
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);