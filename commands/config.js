const { SlashCommandBuilder,roleMention } = require('@discordjs/builders');
const fs = require('fs')
const { authorized,blank } = require('../libs/util.js')
const discord = require('discord.js')

const data = new SlashCommandBuilder()
	.setName('config')
	.setDescription('configuraion for the bot')
	.addSubcommand((sub) =>
		sub.setName('set-roles')
			.setDescription('configures the roles to assign')
			.addRoleOption((opt) =>
				opt.setName('freshman-role')
					.setDescription('role to give to freshmen')
			)
			.addRoleOption((opt)=>
				opt.setName('sophmore-role')
					.setDescription('role to give to sophomores')
			)
			.addRoleOption((opt)=>
				opt.setName('junior-role')
					.setDescription('role to give to juniors')
			)
			.addRoleOption((opt)=>
				opt.setName('senior-role')
					.setDescription('role to give to seniors')
			)
	)
	.addSubcommand((sub) =>
		sub.setName('current')
		.setDescription('prints the configs for this server')
	)
	.addSubcommand((sub)=>
		sub.setName('email')
		.setDescription('email verification config')
		.addRoleOption((opt)=>
			opt.setName('role')
			.setDescription('role to give upon email verification (blank to unset)')
		)
	)
	.addSubcommand((sub)=>
		sub.setName('show-message')
		.setDescription('whether or not to show commands in chat')
		.addBooleanOption((opt)=>
			opt.setName('shown')
			.setDescription('whether commands should be shown in chat')
			.setRequired(true)
		)
	)

//easy way to get config to readable name
const optionNameToRoleName = {
	'freshman-role': 'freshman',
	'sophomore-role': 'sophomore',
	'junior-role': 'junior',
	'senior-role': 'senior'
}

//example role colors
const optionNameToRoleColor = {
	'freshman-role': [255,255,0],
	'sophomore-role': [255,192,203],
	'junior-role': [0,0,255],
	'senior-role': [255,165,0]
}

//gets the roleID or makes a new role if it doesen't exist
async function getroleid(name,interaction){
	var tmp = await interaction.options.getRole(name)
	if (tmp == null){
		tmp = await interaction.guild.roles.create({name: optionNameToRoleName[name],color: optionNameToRoleColor[name]})
	}
	return tmp.id
}

async function func(interaction,client){
	//get the storage 
	try{var db = require('../storage.json')}catch (error){db = blank}
	//get the guildID
	server = interaction.guild.id
	if (db.server[server] == undefined){
		db.server[server]={}
	}
	//subcommands
	switch (interaction.options.getSubcommand(true)){
		//sets the config for what roles are assigned
		case 'set-roles': 
			if (authorized(interaction)){
				if( ! Object.keys(db.server).includes(server)){db.server[server] = {}}
				var froshid = await getroleid('freshman-role',interaction)
				var sophid = await getroleid('sophmore-role',interaction)
				var juniorid = await getroleid('junior-role',interaction)
				var seniorid = await getroleid('senior-role',interaction)
				var roleArray = [froshid,sophid,juniorid,seniorid]
				db.server[server].grade = roleArray
				await interaction.reply({content:`updated roles to <@&${froshid}>,<@&${sophid}>,<@&${juniorid}>,<@&${seniorid}>`,ephemeral:(db.server[server].showMessages)? false:true})
			} else {
				await interaction.reply({content: 'Denied, requires `Manage Server` permissions',ephemeral:(db.server[server].showMessages)? false:true})
			}
		break;
		//send a embed about what the current configs are 
		case 'current':
			if (authorized(interaction)){
				var message = [
					'**---Roles---**',
					`\`Freshman:\` ${roleMention(db.server[server].grade[0])}`,
					`\`Sophmore:\` ${roleMention(db.server[server].grade[1])}`,
					`\`Junior:\`   ${roleMention(db.server[server].grade[2])}`,
					`\`Senior:\`   ${roleMention(db.server[server].grade[3])}`,
					`\`email:\`    ${roleMention(db.server[server].emailRole)}`,
					'**---Other---**',
					`\`showMessages:\` ${(db.server[server].showMessages)? true:false}`
				].join('\n')

				var embed = new discord.MessageEmbed()
					.setColor([0,255,128])
					.setTitle(`Current Server Configs`)
					.addField('current server configuration',message)
				
			}
			await interaction.reply({embeds:[embed],ephemeral:(db.server[server].showMessages)? false:true})
		break;
		//config what the email role is
		case 'email':
			var role = interaction.options.getRole('role')
			if (! authorized(interaction)){
				await interaction.reply({content: 'not authorized to config this',ephemeral:(db.server[server].showMessages)? false:true})
				break;
			}
			if (role == undefined){
				db.server[server].emailRole = undefined
				await interaction.reply({content:'email verified role unset',ephemeral:(db.server[server].showMessages)? false:true})
			} else {
				db.server[server].emailRole = role.id
				await interaction.reply({content:`email verified role set to ${roleMention(role.id)}`,ephemeral:(db.server[server].showMessages)? false:true})
			}
		break;
		//config if ephemeral messages should be disabled
		case 'show-message':
			if (! authorized(interaction)){
				await interaction.reply({content: 'not authorized to config this',ephemeral:(db.server[server].showMessages)? false:true})
				break;
			}
			db.server[server].showMessages = interaction.options.getBoolean('shown')
			await interaction.reply({content:`configs updated to ${db.server[server].showMessages}`,ephemeral:(db.server[server].showMessages)? false:true})
		break;
		default:
			await interaction.reply({content:`invalid command ${interaction.options.getSubcommand(true)}`,ephemeral:(db.server[server].showMessages)? false:true})
		
	}
	//store the data again
	fs.writeFileSync('storage.json',JSON.stringify(db),'utf-8')
}

module.exports={
	'data':data,
	'helpStr':"configs role assignment (requires `manage server`)",
	'canDeploy':true, 
	'guildIds':['783738781097263140'], 
	'function': func 
}