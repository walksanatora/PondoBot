const { SlashCommandBuilder } = require('@discordjs/builders');
const { has,blank,noToYear } = require('../libs/util.js')
const { sendMessage } = require('../libs/email.js')
const fs = require('fs')
const crypto = require('crypto')

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
	.addSubcommand((sub) =>
		sub.setName('verify-email')
			.setDescription('begins email verification')
			.addStringOption((opt) =>
				opt.setName('key')
					.setDescription('the key sent to you in a email')
			)
			.addStringOption((opt) =>
			    opt.setName('username')
					.setDescription('the part before @eduhsd.k12.ca.us')
			)
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
				(db.user[user].grade == null)? await interaction.reply({content:'grade not configured',ephemeral:true}):null
				guildID = interaction.guild.id
				if( ! has(guildID,Object.keys(db.server))) {await interaction.reply({content:'Not Setup, ask someone with `manage channels` to set it up',ephemeral:false})} else{
					interaction.member.roles.remove(db.server[guildID].grade)
					interaction.member.roles.add(db.server[guildID].grade[db.user[user].grade - 1])
					await interaction.reply({content:'roles given',ephemeral:true})
				}
			break;
		case 'verify-email':
				if (interaction.options.getString('key') == null && interaction.options.getString('username') == null ){
					await interaction.reply({content: 'no option specified',ephemeral:true})
				} if (interaction.options.getString('key') != null && interaction.options.getString('username') != null ) {
					await interaction.reply({content: 'please only specify one option',ephemeral:true})
				} if (interaction.options.getString('key') != null) {
					console.log('checking key')
					if (db.user[user].email == null) {
						await interaction.reply({content:'you dont appear to have a email attached to your account',ephemeral:true})
					} else {
						const key = interaction.options.getString('key')
						if (key == crypto.createHash('md5').update(`${user}${process.env.SALT}${db.user[user].email}`).digest('hex')){
							db.user[user].emailVerified = true
							await interaction.reply({content: 'Email Verified',ephemeral:true})
						}else{
							console.log('key mismatch got: ',key,' expected:', crypto.createHash('md5').update(`${user}${process.env.SALT}${db.user[user].email}`).digest('hex'))
							await interaction.reply({content: 'Email verification failed',ephemeral:true})
						}
					}
				} if (interaction.options.getString('key') == null) {
					console.log('sending email')
					const uname = interaction.options.getString('username')
					const key = crypto.createHash('md5').update(`${user}${process.env.SALT}${uname}`).digest('hex')
					db.user[user].email = uname
					const message = [
						`Hello There ${interaction.user.tag}`,
						'You appear to have to ran a email verification, to verify just run',
						`/students verify-email key:${key}`,
						'cant wait to see you :)'
					].join('\n')
					await sendMessage(OAuth2,`${uname}@eduhsd.k12.ca.us`,'your PondoBot verification',message)
					await interaction.reply({content:`email sent to ${uname}@eduhsd.k12.ca.us by fowl21043@eduhsd.k12.ca.us`,ephemeral:true})
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