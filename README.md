<link rel= "stylesheet" type= "text/css" href= "docs.css">
# PondoBot
*a simple bot for Ponderosa High School hub discord servers*<br>
[invite me](https://discord.com/api/oauth2/authorize?client_id=893988257107410944&permissions=380574485568&scope=bot%20applications.commands)

Dont forget to read my [Privacy Policy](PRIVACY.md)

# Features

random [Presences](/bot.js#L10-L16) whenever the bot starts<br>
some [Commands](#commands)

## commands

### help
sends a ephermral (hidden from other users) embed containg command names and help text

### reload
a command used by any whitelisted user (see [here](libs/util.js#L15))<br>
* `bot` reloads the bot via one of two methods (`exit` or `service`(requires a env var set))<br>
* `commands` reloads `global` or `guild` commands (or all if no scope is specified)<br>

### classroom
command for linking email and classroom with the bot<br>
* `link` run the first time to get a code then run and provide code to link (this is how you verify your email)<br>
* `unlink` removes API tokens from your account and un-verified your email<br>
* `classes` list your classes (can specify whether or not to use cached data)<br>

### students
command that involves student data current has 3 sub Commands<br>
* `set-grade` - sets the grade you are in <br>
* `get-role` - gives you your role if the server has been configured<br>
* `lookup` - looks up stored information about a user

### config
command that configures variables for your server<br>
* `set-roles` takes 4 optional arguments for each role (if left blank it will create roles for them)<br>
* `current`	 shows current configs<br>
* `email` sets the role for email-verified users <br>
* `show-message` Config to show messages (whether or not to show ephemeral messages)

# Contribuiting

### adding a command
commands are .js files placed in /commands a example command has been provided [here](/commands/example.js)<br>
as you can see the module has to export a dictionary containg values these values are as follows:<br>
*	data<br>
	The command made by @discordjs/builders.SlashCommandBuilder<br>
*	helpStr<br>
	The string shown when running [/help](/commands/help.js)<br>
*	canDeploy<br>
	Boolean determining whether or not command can be sent to *all* servers the bot is in<br>
*	guildIds<br>
	List of strings of guild ids, used when running [guildCommand.js](/guildCommand.js)<br>
*	function<br>
	the async function to be called when the command has been ran, it has two values passed to it<br>
	first is the [interaction](https://discord.js.org/#/docs/main/stable/class/Interaction)<br>
	second is the [client](https://discord.js.org/#/docs/main/stable/class/Client)<br>

# FAQ
### can I run this bot for my school?
A: yes you just need to set the correct values in `unifiedConfig.json`<br>
a empty json looks like<br>
{<br>
	"DISCORD_TOKEN": "discord bot token to run the bot",<br>
	"DISCORD_CLIENT": "your discord client id",<br>
	"EMAIL_SUFFIX": "the part after the @ schools email ex: @eduhsd.k12.ca.us",<br>
	"SERVICE": "optional systemd service for /reload bot method: service",<br>
	"GoogleOAuth": "google OAuth2 desktop credentials json here"<br>
}<br>
then after those are set just run<br>
`node guildCommands.js`<br>
note: if you want to deploy to specific servers with the above command you need to specify it in the `module.exports.guildIds` of the command<br>
then<br>
`node globalCommands.js`<br>
