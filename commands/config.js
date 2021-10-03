const { SlashCommandBuilder } = require('@discordjs/builders');

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

async function func(interaction,client){
	try{var db = require('../storage.json')}catch (error){db = blank}
	if (await interaction.member.permissions.has('MANAGE_GUILD')){
		var freshman = interaction.options.getRole('freshman-role')
		var sophmore = interaction.options.getRole('sophmore-role')
		var junior = interaction.options.getRole('junior-role')
		var senior = interaction.options.getRole('senior-role')
		console.log(freshman)
		await interaction.reply({content:'Allowed, you have the `Manage Server` permission',ephemeral:true})
	} else {
		await interaction.reply({content: 'Denied, requires `Manage Server` permissions',ephemeral:true})
	}
	fs.writeFileSync('storage.json',JSON.stringify(db),'utf-8')
}

module.exports={
	'data':data,
	'helpStr':"configs role assignment (requires `manage server`)",
	'canDeploy':true, 
	'guildIds':['783738781097263140'], 
	'function': func 
}