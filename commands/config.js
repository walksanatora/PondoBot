const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName('config')
	.setDescription('configuraion for the bot')

async function func(interaction,client){ 
	console.log('does the user have MANAGE_GUILD',await interaction.member.permissions.has('MANAGE_GUILD'))
}

module.exports={
	'data':data,
	'helpStr':"configs role assignment (requires `manage server`)",
	'canDeploy':true, 
	'guildIds':['783738781097263140'], 
	'function': func 
}