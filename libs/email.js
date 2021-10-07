const fs = require('fs');
const {google} = require('googleapis');
const prompt = require('prompt-sync')();

// If modifying these scopes, delete token.json.
var SCOPES = [
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send'
];

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @return {google.auth.OAuth2} The authorized OAuth2 client
 */
async function authorize(credentials) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id,
	  client_secret,
	  redirect_uris[0]
	);

  // Check if we have previously stored a token.
  	
 	try {var token = require('../token.json')}
	catch (error) {
		const authUrl = oAuth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES,
		});
		console.log('Authorize this app by visiting this url:', authUrl);
        
        const code = prompt('Enter code from that page here:');

		await oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error('Error retrieving access token', err);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile('token.json', JSON.stringify(token), (err) => {
				if (err) return console.error(err);
				console.log('Token stored to token.json');
		  	});
			console.log('loading from not loading from token.json')
		});
        return oAuth2Client
	};
    if (token != null) {console.log('loading from token.json',token)
    oAuth2Client.setCredentials(token);
    return oAuth2Client}
}


function makeBody(to, from, subject, message) {
    var str = [
        'Content-Type: text/html; charset="UTF-8"',
        "MIME-Version: 1.0",
        "Content-Transfer-Encoding: 7bit",
        `to: ${to} "`,
        `from: ${from} "`,
        "subject: ", subject, "\n",
        message
    ].join('\n');

    var encodedMail = new Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
        return encodedMail;
}

/**
 * @param {google.auth.OAuth2} auth The authorized OAuth2 client
 * @param {string} recieve The recievers of the email
 * @param {string} subject The subject line of the email
 * @param {string} content The content of the email
*/
async function sendMessage(auth,recieve,subject,content) {
    const gmail = google.gmail({version: 'v1', auth});
	var raw = makeBody(recieve,'PondoBot Verifier', subject, content);
    return await gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        resource: {
            raw: raw
        }
    });
}

module.exports={
	authorize: authorize,
	sendMessage: sendMessage
}

