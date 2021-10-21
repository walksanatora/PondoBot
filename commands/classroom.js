const { SlashCommandBuilder } = require('@discordjs/builders');
const classroom = require('../libs/classroom.js')
const fs = require('fs')

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

async function func(interaction,client){ 
	const db = require('../storage.json')
	const guildID = interaction.guild.id
	const userID = interaction.user.id
	const OAAuth = require('../clsAuth.json')
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
						db.user[userID].email = email.substr(1,email.length-17)
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
		default:
			await interaction.reply({content:'invalid command',ephemeral:(db.server[guildID].showMessages)? false:true})
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