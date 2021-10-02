# PondoBot
*a simple bot for Ponderosa High School hub discord servers*
[invite me](https://discord.com/api/oauth2/authorize?client_id=893988257107410944&permissions=0&scope=bot%20applications.commands)

## commands

### help
sends a ephermiral (hidden from other users) embed containg command names and help text

### reload
a command used by any whitelisted user (see [here](/commands/reload.js#L20))

## Contribuiting

### adding a command
commands are .js files placed in /commands a example command has been provided [here](/commands/example.js)
as you can see the module has to export a dictionary containg values these values are as follows:
*	data
	The command made by @discordjs/builders.SlashCommandBuilder
*	helpStr
	The string shown when running [/help](/commands/help.js)
*	canDeploy
	Boolean determining whether or not command can be sent to *all* servers the bot is in
*	guildIds
	List of strings of guild ids, used when running [guildCommand.js](/guildCommand.js)
*	function
	the async function to be called when the command has been ran, it has two values passed to it
	first is the [interaction](https://discord.js.org/#/docs/main/stable/class/Interaction)
	second is the [client](https://discord.js.org/#/docs/main/stable/class/Client)

