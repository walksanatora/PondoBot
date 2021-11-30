const discord = require('discord.js')
const fs = require('fs');
const cfg = require('./unifiedConfig.json')

const client = new discord.Client({intents: [discord.Intents.FLAGS.GUILD_MESSAGES,discord.Intents.FLAGS.GUILDS]});
// random presences that are changed through every so often
const wittyPresences = [
	'with your sanity',
	'with the concept of life and death',
	'a very complex game',
	'with your heart',
	'with values'
]
// log when the bot starts
client.once('ready', async () => {
	console.log(`Bot is logged in and ready! with tag ${client.user.tag}`);
	client.user.setPresence({ activities: [{ name: wittyPresences[Math.floor(Math.random()*wittyPresences.length)] }], status: 'online' })
	//change the presence every so often
	setInterval(
		function(){
			client.user.setPresence({ activities: [{ name: wittyPresences[Math.floor(Math.random()*wittyPresences.length)] }], status: 'online' })
		},
		10000
	)

});
//load all commands into a global
global.commands = {}
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	global.commands[command.data.name] = command
}
//old non-/ commands for bot<=>bot interaction
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

//run a command from a command file
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return; //if it is not a command, we have nothing to do then
	//log that a command was run by a user
	console.log(`Invoking /${interaction.commandName} from user ${interaction.user.tag}`)
	var db = require('./storage.json') || reuqire('util.js').blank
	var server = interaction.guild.id
	if (db.server[server] == undefined){
		db.server[server]={}
	}
	s.writeFileSync('storage.json',JSON.stringify(db),'utf-8')
	// try running the command
	try {
		await commands[interaction.commandName].function(interaction,client)	
	} catch (error) {
		//load the db to get the configs
		const db = require('./storage.json')
		const guildID = interaction.guild.id
		console.log('ERROR OCCURRED OHNO!!!')
		//make a embed for the error
		const exampleEmbed = new discord.MessageEmbed()
			.setColor('#ff0000')
			.setTitle('Error occured')
			.addField(error.toString(),`\`\`\`${error.stack}\`\`\``)
		console.log(error.stack)
		try {
		try {
			//edit reply or reply
			if (interaction.deferred){
				interaction.editReply({embeds:[exampleEmbed]})
			} else {
				interaction.reply({embeds: [exampleEmbed],ephemeral: (db.server[guildID].showMessages)? false:true})
			}
		} catch (err) {
			//try without the embed
			if (interaction.defered) {
				interaction.editReply(error.toString())
			} else {
				interaction.reply({content: error.toString(),ephemeral: (db.server[guildID].showMessages)? false:true})
			}
		}} catch (err){/*if all else fails do nothing*/}
	}
});

client.login(cfg.DISCORD_TOKEN);