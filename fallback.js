const cfg = require('./unifiedConfig.json')
const discord = require('discord.js')

const client = new discord.Client({intents: [discord.Intents.FLAGS.GUILD_MESSAGES,discord.Intents.FLAGS.GUILDS]});
//log that the bot is in fallback mode
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
// if any command is called let them know that the bot is in fallback mode and give them the logs
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	var db = require('./storage.json')
	var guildID = interaction.guild.id
	if (interaction.commandName != 'reload') {
		await interaction.reply({content:'fallback mode enabled, commands disabled',files:['bot.log'],ephemeral: (db.server[guildID].showMessages)? false:true})
	} else {
		//allow anyone to reload the bot
		await interaction.reply({content:'attempting a reload',ephemeral:(db.server[guildID].showMessages)? false:true})
		process.exit(0)
	}
});

client.login(cfg.DISCORD_TOKEN);