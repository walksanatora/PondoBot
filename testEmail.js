const email = require('./libs/email.js')
const creds = require('./credentials.json')
async function main(){
	const OAuth2 = await email.authorize(creds)
	const message = [
		`Hello There walksanator`,
		'You appear to have to ran a email verification, to verify just run',
		`<b>/students verify-email key:INSERT_KEY_HERE</b>`,
		'cant wait to see you :)'
	].join('<br>\n')
	console.log(OAuth2)
	console.log(message)
	await email.sendMessage(OAuth2,'fowl21043@eduhsd.k12.ca.us','PondoBot verification',message)
	console.log('email sent')
}

main().catch(error=>
	console.log(error.stack)
)
