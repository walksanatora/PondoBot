const { SlashCommandBuilder } = require('@discordjs/builders');
const { exit } = require('process');
const { authorized,blank } = require('../libs/util.js')
const cfg = require('../unifiedConfig.json')

const data = new SlashCommandBuilder()
	.setName('reload')
	.setDescription('reloads the bots state')
	.addSubcommand((sub) =>
		sub.setName('bot')
		.setDescription('reloads the bot')
		.addStringOption((opt) =>
			opt.setName('method')
			.setDescription('the method used to reset the bot')
			.addChoices([
				['service','service'],
				['exit','exit']
			])
			.setRequired(true)
		)
	)
	.addSubcommand((sub) =>
		sub.setName('commands')
		.setDescription('reloads /commands')
		.addStringOption((opt) =>
			opt.setName('scope')
			.setDescription('the scope of the bot commands to load')
			.addChoices([
				['guild','guild'],
				['global','global']
			])
		)
	)

async function func(interaction,client) {
	//get storage or it is blank
	try{var db = require('../storage.json')}catch (error){db = blank}
	//get guildID into a variable for ease of use
	var guildID = interaction.guild.id
	switch (interaction.options.getSubcommand(true)) {
		//reload the bot
		case 'bot':
			if (! authorized(interaction)) {await interaction.reply({content:'not authorized to reload bot',ephemeral:(db.server[guildID].showMessages)? false:true});break}
			const method = interaction.options.getString('method')
			if (method == 'exit'){
				await interaction.reply({content:'exiting, git pulling, npm installing and restarting', ephemeral: (db.server[guildID].showMessages)? false:true})
				client.user.setPresence({ activities: [{ name: 'restarting' }], status: 'dnd' });
				exit()
			} else {
				if (cfg.SERVICE == undefined){
					await interaction.reply({content:'unable to restart service, service name not set in unifiedConfig.json',ephemeral:(db.server[guildID].showMessages)? false:true})
					break;
				}
				await interaction.reply({content:'reloading bot via service',ephemeral:(db.server[guildID].showMessages)? false:true})
				await client.user.setPresence({ activities: [{ name: 'restarting' }], status: 'dnd' });
				execSync(`sudo systemctl restart ${cfg.SERVICE}`)
			}
		break;
		//reload the commands by requiring the reload scripts
		case 'commands':
			if (! authorized(interaction)) {await interaction.reply({content:'not authorized to reload commands',ephemeral:(db.server[guildID].showMessages)? false:true});break}
			const scope = interaction.options.getString('scope')
			if (scope == undefined) {
				require('../guildCommands.js')
				require('../globalCommands.js')
				await interaction.reply({content:'reloaded all commands (wait 1 hr for global to take effect)',ephemeral:(db.server[guildID].showMessages)? false:true})
			} else if (scope == 'guild') {
				require('../guildCommands.js')
				await interaction.reply({content:'reloaded guild commands',ephemeral:(db.server[guildID].showMessages)? false:true})
			} else {
				require('../globalCommands.js')
				await interaction.reply({content:'reloded global commands (wait 1 hr for it to take effect)',ephemeral:(db.server[guildID].showMessages)? false:true})
			}
			
		break;
	}
}

module.exports={
	'data':data, //slash command
	'helpStr':"hard-resets the bot for updates (requires authorization)", //sting to be used when the help command is called
	'canDeploy':true, //can this command be deployed globally to all guilds
	'guildIds':['783738781097263140'], //guildIDs to roll out to when running for test,
	'function': func
}