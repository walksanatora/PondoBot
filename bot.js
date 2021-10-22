const discord = require('discord.js')
const fs = require('fs');
const { execSync } = require("child_process");
const cfg = require('./unifiedConfig.json')

const client = new discord.Client({intents: [discord.Intents.FLAGS.GUILD_MESSAGES,discord.Intents.FLAGS.GUILDS]});

const wittyPresences = [
	'with your sanity',
	'with the concept of life and death',
	'a very complex game',
	'with your heart',
	'with values'
]

client.once('ready', async () => {
	console.log(`Bot is logged in and ready! with tag ${client.user.tag}`);
	client.user.setPresence({ activities: [{ name: wittyPresences[Math.floor(Math.random()*wittyPresences.length)] }], status: 'online' })
	setInterval(
		function(){
			client.user.setPresence({ activities: [{ name: wittyPresences[Math.floor(Math.random()*wittyPresences.length)] }], status: 'online' })
		},
		10000
	)

});

global.commands = {}
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	global.commands[command.data.name] = command
}

client.on('messageCreate', async message => {
	const db = require('./storage.json')
	var con = message.content.trim()
	if (con.startsWith('p!')) {
		con = con.substr(2)
		const cmd = con.split(' ')
		console.log(cmd)
		switch (cmd[0]) {
			case 'user':
				var final = {}
				Object.keys(db.user[cmd[1]]).forEach(key => {
					if (!['auth','CACHECLASS'].includes(key)){
						final[key]=db.user[cmd[1]][key]
					}
				})
				message.reply({content: JSON.stringify(final)})
			break;
			case 'server':
				message.reply({content: JSON.stringify(db.server[message.guild.id])})
			break;
			default:
				break;
		}
	}
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	console.log(`Invoking /${interaction.commandName} from user ${interaction.user.tag}`)
	try {
		await commands[interaction.commandName].function(interaction,client)	
	} catch (error) {
		const db = require('./storage.json')
		const guildID = interaction.guild.id
		console.log('ERROR OCCURRED OHNO!!!')
		const exampleEmbed = new discord.MessageEmbed()
			.setColor('#ff0000')
			.setTitle('Error occured')
			.addField(error.toString(),`\`\`\`${error.stack}\`\`\``)
		console.log(error.stack)
		try {
		try {
			if (interaction.deferred){
				interaction.editReply({embeds:[exampleEmbed]})
			} else {
				interaction.reply({embeds: [exampleEmbed],ephemeral: (db.server[guildID].showMessages)? false:true})
			}
		} catch (err) {
			if (interaction.defered) {
				interaction.editReply(error.toString())
			} else {
				interaction.reply({content: error.toString(),ephemeral: (db.server[guildID].showMessages)? false:true})
			}
		}} catch (err){}
	}
});

client.login(cfg.DISCORD_TOKEN);