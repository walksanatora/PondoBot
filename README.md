# PondoBot
*a simple bot for Ponderosa High School hub discord servers*<br>
[invite me](https://discord.com/api/oauth2/authorize?client_id=893988257107410944&permissions=380574485568&scope=bot%20applications.commands)


# Features

random [Presences](/bot.js#L6-L12) whenever the bot starts<br>
some [Commands](#commands)

## commands

### help
sends a ephermiral (hidden from other users) embed containg command names and help text

### reload
a command used by any whitelisted user (see [here](util.js#L15))

### students
command that involves student data current has 3 sub Commands<br>
* `set-grade` - sets the grade you are in <br>
* `get-grade` - lets you know which grade you are in <br>
* `get-role` - gives you your role if the server has been configured<br>

### config
command that configures variables for your server
* `set-roles` takes 4 optional arguments for each role (if left blank it will create roles for them)

## Contribuiting

### adding a command
commands are .js files placed in /commands a example command has been provided [here](/commands/example.js)<br>
as you can see the module has to export a dictionary containg values these values are as follows:
*	data
	The command made by @discordjs/builders.SlashCommandBuilder<br>
*	helpStr
	The string shown when running [/help](/commands/help.js)
*	canDeploy
	Boolean determining whether or not command can be sent to *all* servers the bot is in<br>
*	guildIds
	List of strings of guild ids, used when running [guildCommand.js](/guildCommand.js)<br>
*	function
	the async function to be called when the command has been ran, it has two values passed to it<br>
	first is the [interaction](https://discord.js.org/#/docs/main/stable/class/Interaction)<br>
	second is the [client](https://discord.js.org/#/docs/main/stable/class/Client)<br>

