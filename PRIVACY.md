# Privicy is the best policy
lets see how I protect yours

## Google APIs scopes and how they are used
* `classroom.courses.readonly` - used for constructing a list of classes for displaying in a embed<br>
* `classroom.profile.emails` - used for getting teachers emails and your email via the `me` path<br>
* `classroom.rosters.readonly` - used for getting your email during initial linking (required to get the profile)

## How is my data obtained
your data is obtained via functions in [libs/classroom.js](https://github.com/walksanatora/PondoBot/blob/master/libs/classroom.js) where simple wrapper functions are written to automate extracting specific values from the api

## What data is collected and how is it used
The following data is collected from the Api
1. a list of classes you are in - used for checking similar classes  between users. plans to implement assignment checking and reminders soon™️ (stored to speed up re-requesting this data)
2. your email - used to make sure you are apart of EDUHSD school district by checking if your email ends in @eduhsd.k12.ca.us (stored to be viewed by other users and give you the email verified role)
3. your teachers information - used when making the class embed so you can click a link and mail your teacher (stored to speed up re-running the command)


## How is the data stored
all data is stored on my (Walker F. Fowlkes) Raspberry Pi 4b (4gb ram) in one of two files
1. `cache.json` - cache of all request sent to Google APIs for faster lookup (can be invalidated by specifiying `cache: true` when using `/classroom classes` which will ignore and re-generate the cache)
   in this file you would find
   the classes you are in
   your teachers information
2. `storage.json` - all user and server related data lives here. your API keys will be stored under your discord ID
Access to the Raspberry pi is limited to only me (Walker F. Fowlkes) through a `wireguard` VPN using SSH using a key which only exist on my laptop
   in this file you would find
   a list of google classroom IDs you are in
   your email
   your google APIs key

## Ok but how do I opt out
just run `/classroom unlink` this will delete your google APIs key from storage.json and unlink your email

## What if the server is breached
1. Pondo Bot will be setup to send out mass-dm messages notifying affected users
2. all of `cache.json`(cached classes/teachers) will be deleted
3. All OAuth2 information will be wiped 
	`storage.json` - all verified users `auth` and `CACHECLASS` values
	`UnifiedConfig.json` - the `GoogleOAuth` field containg the main credentials
4. the OAuth2 credentials in Google cloud console will be deleted
5. OAuth2 credential will be generated and put back into `UnifiedConfig.json`
6. all formerly-verified users will be notified that verification has been fixed and asked to re-verify
