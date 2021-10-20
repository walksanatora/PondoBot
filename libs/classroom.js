const fs = require('fs');
const {google} = require('googleapis');
console.log('loading classroom module')

// If modifying these scopes, delete token.json.
var SCOPES = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.rosters.readonly',
    'https://www.googleapis.com/auth/classroom.course-work.readonly',
    'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
    'https://www.googleapis.com/auth/classroom.announcements.readonly',
    'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
    'https://www.googleapis.com/auth/classroom.topics.readonly',
	'https://www.googleapis.com/auth/classroom.profile.emails'
];

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @return {Object} what is being returned OAuth client/auth url
 */
async function authorize(credentials,token) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id,
	  client_secret,
	  redirect_uris[0]
	);

  // Check if we have previously stored a token.
 	if (typeof token == 'undefined'){
			const authUrl = oAuth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES,
		});
		return authUrl
	} else if (typeof token == 'object') {
        oAuth2Client.setCredentials(token);
        return oAuth2Client
    } else if (typeof token == 'string'){
		const code = await (await oAuth2Client.getToken(token)).tokens
		console.log(code)
		oAuth2Client.setCredentials(code);
		// Store the token to disk for later program executions
		await fs.writeFile('token.json', JSON.stringify(code), (err) => {
			if (err) return console.error(err);
			console.log('written')
		});
		return oAuth2Client
	}
}

async function getClasses(OAuth){
	const classroom = google.classroom({version:'v1',auth: OAuth})
	const classes = (await classroom.courses.list({auth:OAuth},{})).data
	return classes
}

async function getAssignments(OAuth,courseID){
	const classroom = google.classroom({version:'v1',auth: OAuth})
	const classes = (await classroom.courses.courseWork.list({auth:OAuth, courseId: courseID})).data
	return classes
}

async function getEmail(OAuth){
	const classroom = google.classroom({version:'v1',auth: OAuth})
	const out = (await classroom.userProfiles.get({auth:OAuth,userId: 'me'})).data
	return out.emailAddress
}

module.exports={
	authorize: authorize,
	getClasses: getClasses,
	getAssignments: getAssignments,
	getEmail: getEmail,
}
