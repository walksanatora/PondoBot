const { SlashCommandBuilder } = require('@discordjs/builders');
const discord = require('discord.js')

const data = new SlashCommandBuilder() //creating a /command via the special builder
	.setName('help')
	.setDescription('Help embed')

async function func(interaction,client){ // first arg is the interaction object, second arg is the discord client
	const exampleEmbed = new discord.MessageEmbed()
		.setColor([0,255,128])
		.setTitle('A full list of commands')
	const serverCommands = []
	//get all commands that share a guildIds with the current guild or has `canDeploy` set to true
	Object.keys(commands).forEach(element => {
		command = commands[element]
		if (command.guildIds.includes(interaction.guildId) || command.canDeploy){
			serverCommands.push(command)
		}
	});
	//create the embed fields
	serverCommands.forEach(element =>{
		exampleEmbed.addField('/'+element.data.name,element.helpStr,true)
	})
	//send the embed
	await interaction.reply({ embeds:[exampleEmbed],ephemeral: true})
}

module.exports={
	'data':data, //slash command
	'helpStr':"prints off help text", //sting to be used when the help command is called
	'canDeploy':true, //can this command be deployed globally to all guilds
	'guildIds':['783738781097263140'], //guildIDs to roll out to when running for test (strings)
	'function': func //async function to be executed when the command is run
}