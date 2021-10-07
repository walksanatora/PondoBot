const { SlashCommandBuilder,roleMention } = require('@discordjs/builders');
const fs = require('fs')
const { has,authorized } = require('../libs/util.js')

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

const blank = {	
	user: {},
	server: {}
}

const optionNameToRoleName = {
	'freshman-role': 'freshman',
	'sophomore-role': 'sophomore',
	'junior-role': 'junior',
	'senior-role': 'senior'
}

const optionNameToRoleColor = {
	'freshman-role': [255,255,0],
	'sophomore-role': [255,192,203],
	'junior-role': [0,0,255],
	'senior-role': [255,165,0]
}

async function getroleid(name,interaction){
	var tmp = await interaction.options.getRole(name)
	if (tmp == null){
		tmp = await interaction.guild.roles.create({name: optionNameToRoleName[name],color: optionNameToRoleColor[name]})
	}
	return tmp.id
}

async function func(interaction,client){
	try{var db = require('../storage.json')}catch (error){db = blank}
	server = interaction.guild.id
	switch (interaction.options.getSubcommand(true)){
		case 'set-roles': 
			if (authorized(interaction)){
				if( ! has(server,Object.keys(db.server))){db.server[server] = {}}
				var froshid = await getroleid('freshman-role',interaction)
				var sophid = await getroleid('sophomore-role',interaction)
				var juniorid = await getroleid('junior-role',interaction)
				var seniorid = await getroleid('senior-role',interaction)
				var roleArray = [froshid,sophid,juniorid,seniorid]
				db.server[server].grade = roleArray
				await interaction.reply({content:`updated roles to <@&${froshid}>,<@&${sophid}>,<@&${juniorid}>,<@&${seniorid}>`,ephemeral:true})
			} else {
				await interaction.reply({content: 'Denied, requires `Manage Server` permissions',ephemeral:true})
			}
			fs.writeFileSync('storage.json',JSON.stringify(db),'utf-8')
		break;
		case 'current':
			if (authorized(interaction)){
				var messasge = [
					'***---Roles---***',
					`\`Freshman:\` ${roleMention(db.server[server].grade[0])}`,
					`\`Sophmore:\` ${roleMention(db.server[server].grade[1])}`,
					`\`Junior:\`   ${roleMention(db.server[server].grade[2])}`,
					`\`Senior:\`   ${roleMention(db.server[server].grade[3])}`,
				].join('\n')

				var embed = new discord.MessageEmbed()
					.setColor([0,255,128])
					.setTitle(`Information on ${interaction.options.getUser('user').tag}`)
					.addField('current server configuration',message)
				
			}

		default:
			await interaction.reply({content:'invalid command',ephemeral:true})
		
	}
}

module.exports={
	'data':data,
	'helpStr':"configs role assignment (requires `manage server`)",
	'canDeploy':true, 
	'guildIds':['783738781097263140'], 
	'function': func 
}