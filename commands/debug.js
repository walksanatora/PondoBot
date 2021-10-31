const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName('debug')
	.setDescription('debugs stuff')
	.setDefaultPermission(false)
	.addSubcommandGroup((group)=>
		group.setName('user')
		.setDescription('subcommands for managing user data')
		.addSubcommand((sub)=>
			sub.setName('de-api')
			.setDescription('forecefully removes their api tokens')
			.addUserOption((opt)=>
				opt.setName('target')
				.setDescription('the victim to de-auth')
				.setRequired('true')
			)
		)
		.addSubcommand((sub)=>
			sub.setName('force-grade')
			.setDescription('force-sets their grade')
			.addUserOption((opt)=>
				opt.setName('target')
				.setDescription('the victim to de-auth')
				.setRequired('true')
			)
			.addStringOption((opt) =>
				opt.setName('year')
				.setDescription('the year you put them in')
				.addChoices([
					['Freshman', '1'],
					['Sophomore','2'],
					['Junior', '3'],
					['Senior', '4']
				])
				.setRequired(true)
			)
		)
	)

async function func(interaction,client){ 
	try{var db = require('../storage.json')}catch (error){db = require('../libs/util.js').blank}
	try{var cache = require('../cache.json')}catch (error){cache = {
		class: {},
		user: {}
	}}
	switch (interaction.options.getSubcommandGroup(true)) {
		case 'user':
			switch (interaction.options.getSubcommand(true)){
				case 'de-api':
					var target = interaction.options.getUser('target')
					if(!Object.keys(db.user).includes(target.id)){db.user[target.id] = {}}
					db.user[target.id].auth = undefined
					db.user[target.id].emailVerified = undefined
					db.user[target].email = undefined
				break;
				case 'force-grade':
					var target = interaction.options.getUser('target')
					if(!Object.keys(db.user).includes(target.id)){db.user[target.id] = {}}
					db.user[target.id].grade = Number(interaction.options.getString('year',true))
				break;
			}
			break;
	
		default:
			break;
	}

	console.log('this was ran')
	fs.writeFileSync('storage.json',JSON.stringify(db),'utf-8')
	fs.writeFileSync('cache.json',JSON.stringify(cache),'utf-8')
}

module.exports={
	'data':data,
	'helpStr':"debug",
	'canDeploy':false,
	'guildIds':['783738781097263140'],
	'function': func
}