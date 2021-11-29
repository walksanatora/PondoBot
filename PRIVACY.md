# Privicy is the best policy
lets see how I protect yours

## Your data is used
1. [list your classes](commands/classroom.js#L92-L194)
2. [verify your email](commands/classroom.js#L68-L76)

## How your data is stored
your data is stored in plain json and will never be touched unless being read by the cache<br>
see [bot-loop.sh](bot-loop.sh) for how the bot is ran<br>
all data is stored on a Raspberry Pi 4b running rasbian with a desktop under ssh using a key which only I (Walker F. Fowlkes)
your data shall ***NEVER*** be transfered

## What data is collected
the only data collected is<br>
1. your email (for usage in email verification and allowing other students to email you)<br>
2. the classes you are in (for usage in providing class list and classes you share with other users)

data about your email is collected when you first link 
data about classes you have are only used afert calling [/classroom classes](/commands/classroom.js#l93-197)

## What if the server is breached
1. Pondo Bot will be setup to send out mass-dm messages notifying affected users
2. all of `cache.json`(cached classes/teachers) will be deleted
3. All OAuth2 information will be wiped 
	`storage.json` - all verified users `auth` and `CACHECLASS` values
	`UnifiedConfig.json` - the `GoogleOAuth` field containg the main credentials
	the OAuth2 credentials in Google cloud console
4. OAuth2 credential will be re-generated and put back into `UnifiedConfig.json`
5. all formerly-verified users will be notified that verification has been fixed and asked to re-verify


All data is handled according to [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)