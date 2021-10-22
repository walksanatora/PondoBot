const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const cfg = require('./unifiedConfig.json')
const fs = require('fs');

//get the command
var commands = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const clientId = cfg.DISCORD_CLIENT

//get the commands and the guild to put them to
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	command.guildIds.forEach(element => {
		if (typeof commands[element] != 'object'){commands[element] = []; console.log('new id')}
		commands[element].push(command.data.toJSON())
	});
}
console.log(commands)

//make a REST api
const rest = new REST({ version: '9' }).setToken(cfg.DISCORD_TOKEN);

//load the commands on each guild specified
(async () => {
	try {
		console.log('Started refreshing application (/) commands.');
		Object.keys(commands).forEach(async key => {
			await rest.put(
				Routes.applicationGuildCommands(clientId, key),
				{ body: commands[key] },
			);
		});

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
