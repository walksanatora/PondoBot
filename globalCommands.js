const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const cfg = require('./unifiedConfig.json')
const fs = require('fs');

//get all commands
var commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const clientId = cfg.DISCORD_CLIENT

//move all commands into the list
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	command.guildIds.forEach(element => {
		if (command.canDeploy) {
		commands.push(command.data.toJSON())
	}});
}
//list all the commands found
console.log(commands)
//ready the REST api
const rest = new REST({ version: '9' }).setToken(cfg.DISCORD_TOKEN);

//push the commands
(async () => {
	try {
		console.log('Started refreshing global application (/) commands.');
		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);
		console.log('Successfully reloaded global application (/) commands\n wait 1hr for them to become visible');
	} catch (error) {
		console.error(error);
	}
})();
