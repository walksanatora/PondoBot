const { SlashCommandBuilder } = require('@discordjs/builders');
const discord = require('discord.js')
const os = require('os');
const { exit } = require('process');
const { authorized } = require('../libs/util.js')

const data = new SlashCommandBuilder()
	.setName('reload')
	.setDescription('reloads the bots state')


async function func(interaction,client) {
	if (authorized(interaction)) {
		await interaction.reply({content:'reloading Bot, git pulling, npm installing and restarting', ephemeral: true})
		client.user.setPresence({ activities: [{ name: 'restarting' }], status: 'dnd' });
		exit()
	} else {
		await interaction.reply({content:'not authorized to reload the bot', ephemeral: true})
	}
}

module.exports={
	'data':data, //slash command
	'helpStr':"hard-resets the bot for updates (requires authorization)", //sting to be used when the help command is called
	'canDeploy':true, //can this command be deployed globally to all guilds
	'guildIds':['783738781097263140'], //guildIDs to roll out to when running for test,
	'function': func
}