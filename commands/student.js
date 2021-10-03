const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs')

function has(value,array) {
	let hasValue = false
	array.forEach(element => {
		if (element == value){
			hasValue = true
		}
	})
	return hasValue
}

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

const noToYear ={
	1:'freshman',
	2:'sophmore',
	3:'junior',
	4:'senior'
}

const blank = {
	user: {},
	server: {}
}

async function func(interaction,client){
	try{var db = require('../storage.json')}catch (error){db = blank}
	user = interaction.user.id
	if( ! has(user,Object.keys(db.user))){db.user[user] = {}}
	switch (interaction.options.getSubcommand(true)) {
		case 'set-grade':
				db.user[user].grade = Number(interaction.options.getString('year',true))
				interaction.reply({content:`updated year to id ${db.user[user].grade}`,ephemeral:true})
			break;
		case 'get-grade':
				interaction.reply({content:`your are currently in ${noToYear[db.user[user].grade]} year`,ephemeral:true})
			break;
		default:
			interaction.reply({content:'invalid command',ephemeral:true})
	}
	fs.writeFileSync('storage.json',JSON.stringify(db),'utf-8')
}

module.exports={
	'data':data,
	'helpStr':"list off some device status information",
	'canDeploy':true,
	'guildIds':['783738781097263140'],
	'function': func 
}