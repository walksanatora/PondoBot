# Privicy is the best policy
lets see how I protect yours

## Google APIs scopes and how they are used
* `classroom.courses.readonly` - used for constructing a list of classes for displaying in a embed<br>
* `classroom.profile.emails` - used for getting teachers emails and your email via the `me` path<br>
* `classroom.rosters.readonly` - due to a weird quirk we are unable to get your email if this is not authorized

## How is the data stored
all data is stored on my (Walker F. Fowlkes) Raspberry Pi 4b (4gb ram) in one of two files
1. `cache.json` - cache of all request sent to Google APIs for faster lookup (can be invalidated by specifiying `cache: true` when using `/classroom classes`)
2. `storage.json` - all user and server related data lives here. your API keys will be stored under your discord ID
Access to the Raspberry pi is limited to only me (Walker F. Fowlkes) through a `wireguard` VPN using SSH using a key which only exist on my laptop

## What if the server is breached
1. Pondo Bot will be setup to send out mass-dm messages notifying affected users
2. all of `cache.json`(cached classes/teachers) will be deleted
3. All OAuth2 information will be wiped 
	`storage.json` - all verified users `auth` and `CACHECLASS` values
	`UnifiedConfig.json` - the `GoogleOAuth` field containg the main credentials
4. the OAuth2 credentials in Google cloud console
5. OAuth2 credential will be re-generated and put back into `UnifiedConfig.json`
6. all formerly-verified users will be notified that verification has been fixed and asked to re-verify


All data is handled according to [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)