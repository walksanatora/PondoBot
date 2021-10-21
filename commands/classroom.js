const { SlashCommandBuilder } = require('@discordjs/builders');
const { blank } = require('../libs/util.js')
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
	try{var db = require('../storage.json')}catch (error){db = blank}
	try{var cache = require('../cache.json')}catch (error){cache = {
		class: {},
		user: {}
	}}
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
			interaction.deferReply({ephemeral:(db.server[guildID].showMessages)? false:true})
			console.log('defering reply')
			if (db.user[userID].auth == undefined){await interaction.editReply({content: 'not linked yet',ephemeral:(db.server[guildID].showMessages)? false:true});break}
			var OAAuth = await classroom.authorize(OAAuth,db.user[userID].auth)
			console.log('checking cache usage')
			if (db.user[userID].CACHECLASS == undefined || interaction.options.getBoolean('cache')){
				console.log('over-writing cache')
				var array = (await classroom.getClasses(OAAuth)).courses
				var active = {} //data to be joined to the cache, key == id
				var activeIDs = [] //ids to be stored to the user
				//only read classes that are ACTIVE
				for (let index = 0; index < array.length; index++) {
					if (array[index].courseState == 'ACTIVE'){
						active[array[index].id] = array[index]
						activeIDs.push(array[index].id)
						console.log('cached',array[index].id)
					}
				}
				db.user[userID].CACHECLASS = activeIDs
				console.log(activeIDs)
				//this amalgamates the classes toghether instead of just overwriting them
				for (let i = 0;i<activeIDs.length;i++){
					v = activeIDs[i]
					cache.class[v.id] = v
					console.log('cached',v)
				}
			}
			console.log('caching finished')
			console.log(cache)
			fs.writeFileSync('cache.json',JSON.stringify(cache),'utf-8')
			console.log('written cache to file')
			const embd = new discord.MessageEmbed()
				.setColor([0,255,128])
				.setTitle('A full list of your classes')
			for (const i of Object.keys(db.user[userID].CACHECLASS)){
				clas = cache.class[db.user[userID].CACHECLASS[i]]
				console.log('getting class information')
				if (cache.user[clas.ownerId] == undefined || interaction.options.getBoolean('cache')){
					var teacher = await classroom.getTeacher(OAAuth,clas.id,clas.ownerId)
					cache.user[clas.ownerId] = teacher
					console.log('added',teacher.name.fullName,'to cache, and written')
					fs.writeFileSync('cache.json',JSON.stringify(cache),'utf-8')
				}
				var teacher = cache.user[clas.ownerId]
				var content = [
					`Teacher: ${teacher.name.fullName}`,
					`Email: ${teacher.emailAddress}`,
					`Link: [Here](${clas.alternateLink})`
				].join('\n')
				console.log(tmp)
				embd.addField(command.name,content,tmp)
			}
			console.log('editing reply, embed finished')
			await interaction.editReply({embeds: [embd],ephemeral:(db.server[guildID].showMessages)? false:true})
			break;
		default:
			await interaction.reply({content:'invalid command',ephemeral:(db.server[guildID].showMessages)? false:true})
		}
	fs.writeFileSync('storage.json',JSON.stringify(db),'utf-8')
	fs.writeFileSync('cache.json',JSON.stringify(cache),'utf-8')
}

module.exports={
	'data':data,
	'helpStr':"interactions with google classroom",
	'canDeploy':true,
	'guildIds':['783738781097263140'],
	'function': func
}