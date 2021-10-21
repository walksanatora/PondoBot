const { SlashCommandBuilder } = require('@discordjs/builders');
const classroom = require('../libs/classroom.js')
const fs = require('fs')
const discord = require('discord.js')

const data = new SlashCommandBuilder()
	.setName('classroom')
	.setDescription('connects with google classroom')
	.addSubcommand((sub) =>
		sub.setName('link')
		.setDescription('links to classroom')
		.addStringOption((opt) =>
			opt.setName('code')
			.setDescription('the code it told you to enter')
		)
	)
	.addSubcommand((sub)=>
		sub.setName('unlink')
		.setDescription('removes the api keys from storage (also marks email as unverified)')
	)
	.addSubcommand((sub)=>
		sub.setName('classes')
		.setDescription('list your classes')
		.addBooleanOption((opt)=>
			opt.setName('cache')
			.setDescription('whether or not to force invalidate the cache and overwrite it')
		)
	)

async function func(interaction,client){ 
	const db = require('../storage.json')
	const guildID = interaction.guild.id
	const userID = interaction.user.id
	var OAAuth = require('../clsAuth.json')
	switch (interaction.options.getSubcommand(true)) {
		case 'link':
			const code = interaction.options.getString('code')
			if (code == undefined){
				if(db.user[userID].auth == undefined){
					var out = await classroom.authorize(OAAuth)
					if (typeof out == 'string'){
						await interaction.reply({content:`Please head [here](${out}) to get code`,ephemeral:true})
					}
				} else {
					interaction.reply({content:'allready linked',ephemeral:(db.server[guildID].showMessages)? false:true})
				}
			} else {
				console.log(code)
				const token = await classroom.authorize(OAAuth,code)
				if (typeof token == 'object'){
					const email = await classroom.getEmail(token[1])
					if (email.endsWith('@eduhsd.k12.ca.us')){
						db.user[userID].auth = token[0]
						db.user[userID].email = email.substr(0,email.length-18)
						db.user[userID].emailVerified = true
						await interaction.reply({content:'linked classroom with bot',ephemeral:true})
					} else {
						await interaction.reply({content:'unable to link, email not apart of eduhsd'})
					}
				}
			}
			break;
		case 'unlink':
			if (db.user[userID].auth==undefined) {
				await interaction.reply({content:'you cant unlink something that isn\'t linked',ephemeral:(db.server[guildID].showMessages)? false:true})
			} else {
				db.user[userID].auth = undefined
				db.user[userID].emailVerified = false
				await interaction.reply({content:'unlinked information',ephemeral:(db.server[guildID].showMessages)? false:true})
			}
			break;
		case 'classes':
			if (db.user[userID].auth == undefined){await interaction.reply({content: 'not linked yet',ephemeral:(db.server[guildID].showMessages)? false:true});break}
			var OAAuth = await classroom.authorize(OAAuth,db.user[userID].auth)
			if (db.user[userID].CACHECLASS == undefined || interaction.options.getBoolean('cache')){
				var array = (await classroom.getClasses(OAAuth)).courses
				var active = []
				for (let index = 0; index < array.length; index++) {
					if (array[index].courseState == 'ACTIVE'){
						active.push(array[index])
					}
				}
				db.user[userID].CACHECLASS = active
			}
			console.log(db.user[userID].CACHECLASS)
			const embd = new discord.MessageEmbed()
				.setColor([0,255,128])
				.setTitle('A full list of your classes')
			for (const element of Object.keys(db.user[userID].CACHECLASS)){
				command = db.user[userID].CACHECLASS[element]
				var teacher = await classroom.getTeacher(OAAuth,command.id,command.ownerId)
				console.log(command.ownerId)
				console.log(teacher)
				var content = [
					`Teacher: ${teacher.name.fullName}`,
					`Email: ${teacher.emailAddress}`,
					`Link: [Here](${command.alternateLink})`
				].join('\n')
				embd.addField(command.name,teacher.name.fullName)
			};
			await interaction.reply({content: 'ohno',ephemeral:(db.server[guildID].showMessages)? false:true})
			break;
		default:
			await interaction.reply({content:'invalid command',ephemeral:(db.server[guildID].showMessages)? false:true})
		}
	fs.writeFileSync('storage.json',JSON.stringify(db),'utf-8')
}

module.exports={
	'data':data,
	'helpStr':"interactions with google classroom",
	'canDeploy':true,
	'guildIds':['783738781097263140'],
	'function': func
}