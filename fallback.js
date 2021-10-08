require('dotenv').config()
const discord = require('discord.js')

const client = new discord.Client({intents: [discord.Intents.FLAGS.GUILD_MESSAGES,discord.Intents.FLAGS.GUILDS]});

client.once('ready', async () => {
	console.log(`Running in Fallback! with tag ${client.user.tag}`);
	client.user.setPresence({ activities: [{ name: 'fallback mode' }], status: 'online' })
	setInterval(
		function(){
			client.user.setPresence({ activities: [{ name: 'fallback mode' }], status: 'online' })
		},
		10000
	)

});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	var db = require('./storage.json')
	var guildID = interaction.guild.id
	if (interaction.commandName != 'reload') {
		await interaction.reply({content:'fallback mode enabled, commands disabled',files:['bot.log'],ephemeral: (db.server[guildID].showMessages)? false:true})
	} else {
		await interaction.reply({content:'attempting a reload',ephemeral:(db.server[guildID].showMessages)? false:true})
		process.exit(0)
	}
});

client.login(process.env.DISCORD_TOKEN);