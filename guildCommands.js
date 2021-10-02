const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config()
const fs = require('fs');

var commands = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Place your client and guild ids here
const clientId = '836675357389881374';

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	command.guildIds.forEach(element => {
		if (typeof commands[element] != 'object'){commands[element] = []; console.log('new id')}
		commands[element].push(command.data.toJSON())
	});
}
console.log(commands)

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

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
