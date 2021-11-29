const { SlashCommandBuilder } = require('@discordjs/builders');
const { blank,checker } = require('../libs/util.js')
const classroom = require('../libs/classroom.js')
const fs = require('fs')
const discord = require('discord.js')
const cfg = require('../unifiedConfig.json')

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
		.addUserOption((opt)=>
			opt.setName('user')
			.setDescription('user to check for similar classes')
		)
	)

async function func(interaction,client){ 
	// make sure the files have data, if they dont give them default data
	try{var db = require('../storage.json')}catch (error){db = blank}
	try{var cache = require('../cache.json')}catch (error){cache = {
		class: {},
		user: {}
	}}
	// constants to read storage
	const guildID = interaction.guild.id
	const userID = interaction.user.id

	// get the OAuth credentials from configs
	var OAAuth = cfg.GoogleOAuth
	//switch to run commands
	switch (interaction.options.getSubcommand(true)) {
		//link the classroomAPI to the bot
		case 'link':
			const code = interaction.options.getString('code')
			if (code == undefined){
				if(!Object.keys(db.user).includes(userID)){db.user[userID] = {}}
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
					if (email.endsWith(cfg.EMAIL_SUFFIX)){
						db.user[userID].auth = token[0]
						db.user[userID].email = email.substr(0,email.length-(cfg.EMAIL_SUFFIX.length+1))
						db.user[userID].emailVerified = true
						await interaction.reply({content:'linked classroom with bot',ephemeral:true})
					} else {
						await interaction.reply({content:'unable to link, email not apart of eduhsd'})
					}
				}
			}
			break;
		//delete auth credentials
		case 'unlink':
			if(!Object.keys(db.user).includes(userID)){db.user[userID] = {}}
			if (db.user[userID].auth==undefined) {
				await interaction.reply({content:'you cant unlink something that isn\'t linked',ephemeral:(db.server[guildID].showMessages)? false:true})
			} else {
				db.user[userID].auth = undefined
				db.user[userID].emailVerified = false
				await interaction.reply({content:'unlinked information',ephemeral:(db.server[guildID].showMessages)? false:true})
			}
			break;
		//get classes of the user
		case 'classes':
			if(!Object.keys(db.user).includes(userID)){db.user[userID] = {}}
			//defer the reply since this may take a while
			await interaction.deferReply({ephemeral:(db.server[guildID].showMessages)? false:true})
			console.log('defered reply')
			// return if they have not linked yet
			if (db.user[userID].auth == undefined){await interaction.editReply({content: 'not linked yet',ephemeral:(db.server[guildID].showMessages)? false:true});break}
			// authorize the classroom api
			var OAAuth = await classroom.authorize(OAAuth,db.user[userID].auth)
			// regen the cache if the user has no CACHECLASS or cache.class is empty or they force no-cache
			if (db.user[userID].CACHECLASS == undefined || cache.class === {} || interaction.options.getBoolean('cache')){
				console.log('over-writing cache')
				var array = (await classroom.getClasses(OAAuth)).courses
				var active = {} //data to be joined to the cache, key == id
				var activeIDs = [] //ids to be stored to the user
				//only read classes that are ACTIVE
				for (let index = 0; index < array.length; index++) {
					if (array[index].courseState == 'ACTIVE'){
						active[array[index].id] = array[index]
						activeIDs.push(array[index].id)
						console.log('cached classID',array[index].id)
					}
				}
				db.user[userID].CACHECLASS = activeIDs
				console.log(activeIDs)
				//this amalgamates the classes toghether instead of just overwriting them
				for (let i = 0;i<activeIDs.length;i++){
					v = active[activeIDs[i]]
					cache.class[v.id] = v
					console.log('cached class (list)',v)
				}
			}
			//make sure we have all the classes cached incase they got a new class
			if (!checker(Object.keys(cache.class),db.user[userID].CACHECLASS)){
				const diff = db.user[userID].CACHECLASS.filter(k=>!Object.keys(cache.class).includes(k))
				for (let i = 0;i<diff.length;i++){
					v = diff[i]
					const clas = await classroom.getClass(OAAuth,v)
					cache.class[v] = clas
					console.log('cached class (get)',v)
				}
			}
			//whether or not to get their classes *or* look for classes they have in common
			if (interaction.options.getUser('user') == undefined){
				//make the embed
				const embd = new discord.MessageEmbed()
					.setColor([0,255,128])
					.setTitle('A full list of your classes')
				//itterate over the classes
				for (const i of Object.keys(db.user[userID].CACHECLASS)){
					//get the class from the cache
					clas = cache.class[db.user[userID].CACHECLASS[i]]
					//get the teacher from Google API if it is not cached or forcing a cache regen
					if (cache.user[clas.ownerId] == undefined || interaction.options.getBoolean('cache')){
						var teacher = await classroom.getTeacher(OAAuth,clas.id,clas.ownerId)
						cache.user[clas.ownerId] = teacher
						console.log('cached user',clas.ownerId)
					}
					//get teacher from cache
					var teacher = cache.user[clas.ownerId]
					// created the embed content
					var content = [
						`Teacher: ${teacher.name.fullName}`,
						`Email: ${teacher.emailAddress}`,
						`Link: [Here](${clas.alternateLink})`
					].join('\n')
					//add it to the embed
					embd.addField(clas.name,content)
				}
				// edit the defered reply with the embed
				console.log('editing reply, embed finished')
				await interaction.editReply({embeds: [embd],ephemeral:(db.server[guildID].showMessages)? false:true})
			} else {
				const other = interaction.options.getUser('user')
				if (db.user[other.id].CACHECLASS == undefined){
					await interaction.editReply({content: 'user does not have any of their classes stored'})
					break;
				}
				const embd = new discord.MessageEmbed()
					.setColor([0,255,128])
					.setTitle(`classes you and ${other.tag} share`)
				const same = db.user[userID].CACHECLASS.filter(k=>db.user[other.id].CACHECLASS.includes(k))
				for (const i of same){
					clas = cache.class[i]
					if (cache.user[clas.ownerId] == undefined || interaction.options.getBoolean('cache')){
						var teacher = await classroom.getTeacher(OAAuth,clas.id,clas.ownerId)
						cache.user[clas.ownerId] = teacher
						console.log('cached user',clas.ownerId)
					}
				
					var teacher = cache.user[clas.ownerId]
					// created the embed content
					var content = [
						`Teacher: ${teacher.name.fullName}`,
						`Email: ${teacher.emailAddress}`,
						`Link: [Here](${clas.alternateLink})`
					].join('\n')
					embd.addField(clas.name,content)
				}
				console.log('editing reply, embed finished')
				await interaction.editReply({embeds: [embd],ephemeral:(db.server[guildID].showMessages)? false:true})
			}
			break;
		default:
			await interaction.reply({content:'invalid command',ephemeral:(db.server[guildID].showMessages)? false:true})
		}
	//save the storage and cache back to their files
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