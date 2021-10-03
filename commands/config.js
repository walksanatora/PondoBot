const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName('config')
	.setDescription('configuraion for the bot')

async function func(interaction,client){ 
	if (await interaction.member.permissions.has('MANAGE_GUILD')){
		await interaction.reply({content:'Allowed, you have the `Manage Server` permission',ephemeral:true})
	} else {
		await interaction.reply({content: 'Denied, requires `Manage Server` permissions',ephemeral:true})
	}

}

module.exports={
	'data':data,
	'helpStr':"configs role assignment (requires `manage server`)",
	'canDeploy':true, 
	'guildIds':['783738781097263140'], 
	'function': func 
}