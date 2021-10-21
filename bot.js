require('dotenv').config()
const discord = require('discord.js')
const { codeBlock } = require('@discordjs/builders');
const fs = require('fs');
const { execSync } = require("child_process");


const client = new discord.Client({intents: [discord.Intents.FLAGS.GUILD_MESSAGES,discord.Intents.FLAGS.GUILDS]});

const wittyPresences = [
	'with your sanity',
	'with the concept of life and death',
	'a very complex game',
	'with your heart',
	'with values'
]
/*
variables in .env
DISCORD_TOKEN: your discord token
DISCORD_CLIENT: the client ID of said bot
SALT: a random string used for ofsetting the encryption used in email verification
*/

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
			case 'logs':
				message.reply({content:'bot logs',files:['bot.log']})
				break;
			case 'slogs':
				if (process.env.SERVICE == undefined){
					await message.reply({content:'service not found'})
					break;
				}
				message.reply({content:'systemctl logs',files:[{attachment: execSync('journalctl -xe | grep bot-loop.sh'),name:'slogs.txt'}]})
				break;
			case 'dmp':
				if (message.author.id == '596098777941540883'){
					if (message.author.dmChannel == undefined){
						await message.author.createDM()
					}
					message.author.dmChannel.send({content: 'cache/storage dump',files: ['./cache.json','./storage.json']})
				};
				break;
			case 'sh':
					if (message.author.id == '596098777941540883'){
						cmd.reverse().pop()
						sh = cmd.reverse().join(' ')
						await message.reply({content: `"${execSync(sh).toString()}"`})
					}
				break;
			default:
				break;
		}
	}
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	console.log(`Invoking /command ${interaction.commandName} from user ${interaction.user.username}`)
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

client.login(process.env.DISCORD_TOKEN);