require('dotenv').config()
const discord = require('discord.js')
const { codeBlock } = require('@discordjs/builders');
const fs = require('fs');

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
*/

client.once('ready', () => {
	console.log('Ready!');
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
	commands[command.data.name] = command
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	console.log(`Invoking /command ${interaction.commandName} from user ${interaction.user.username}`)
	try {
		await commands[interaction.commandName].function(interaction,client)	
	} catch (error) {
		const exampleEmbed = new discord.MessageEmbed()
			.setColor('#ff0000')
			.setTitle('Error occured')
			.addField('Excpetion',error.toString())
			.addField('Detail',codeBlock(error.stack))
		console.log(error.stack)
		await interaction.reply({embeds: [exampleEmbed]})
	}
});

client.login(process.env.DISCORD_TOKEN);