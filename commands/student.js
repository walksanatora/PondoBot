const { SlashCommandBuilder } = require('@discordjs/builders');
const { has,blank,noToYear } = require('../util.js')
const fs = require('fs')


const data = new SlashCommandBuilder()
	.setName('students')
	.setDescription('logs something to the console')
	.addSubcommand((sub) => 
		sub.setName('set-grade')
			.setDescription('sets the grade you are in school')
			.addStringOption((opt) =>
				opt.setName('year')
					.setDescription('the year you are in')
					.addChoices([
						['Freshman', '1'],
						['Sophomore','2'],
						['Junior', '3'],
						['Senior', '4']
					])
					.setRequired(true)
			)
	)
	.addSubcommand((sub) =>
		sub.setName('get-grade')
			.setDescription('lets you know what your currently configured grade is')
	)
	.addSubcommand((sub)=>
		sub.setName('get-role')
			.setDescription('assigns you the role configured for this server for your grade')
	)

async function func(interaction,client){
	try{var db = require('../storage.json')}catch (error){db = blank}
	user = interaction.user.id
	if( ! has(user,Object.keys(db.user))){db.user[user] = {}}
	switch (interaction.options.getSubcommand(true)) {
		case 'set-grade':
				db.user[user].grade = Number(interaction.options.getString('year',true))
				await interaction.reply({content:`updated year to id ${db.user[user].grade}`,ephemeral:true})
			break;
		case 'get-grade':
				await interaction.reply({content:`your are currently in ${noToYear[db.user[user].grade]} year`,ephemeral:true})
			break;
		case 'get-role':
				(db.user[user].grade = null)? await interaction.reply({content:'grade not configured',ephemeral:true}):null
				guildID = interaction.guild.id
				if( ! has(guildID,Object.keys(db.server))) {await interaction.reply({content:'Not Setup, ask someone with `manage channels` to set it up',ephemeral:false})} else{
					interaction.member.roles.remove(db.server[guildID].grade)
					interaction.member.roles.add(db.server[guildID].grade[db.user[user].grade - 1])
					await interaction.reply({content:'roles given',ephemeral:true})
				}
			break;
		default:
			await interaction.reply({content:'invalid command',ephemeral:true})
	}
	fs.writeFileSync('storage.json',JSON.stringify(db),'utf-8')
}

module.exports={
	'data':data,
	'helpStr':"configs the grade you are in, and gives you roles",
	'canDeploy':true,
	'guildIds':['783738781097263140'],
	'function': func 
}