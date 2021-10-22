const fs = require('fs');
const {google} = require('googleapis');
console.log('loading classroom module')

var SCOPES = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.rosters.readonly',
    'https://www.googleapis.com/auth/classroom.announcements.readonly',
	'https://www.googleapis.com/auth/classroom.course-work.readonly',
    'https://www.googleapis.com/auth/classroom.topics.readonly',
	'https://www.googleapis.com/auth/classroom.profile.emails'
];

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @return {Object} what is being returned OAuth client/auth url
 */
async function authorize(credentials,code) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id,
	  client_secret,
	  redirect_uris[0]
	);

  // Check if we have previously stored a code.
 	if (typeof code == 'undefined'){
			const authUrl = oAuth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES,
		});
		return authUrl
    } else if (typeof code == 'string'){
		const token = (await oAuth2Client.getToken(code)).tokens
		oAuth2Client.setCredentials(token)
		return [token,oAuth2Client]
	} else if (typeof code == 'object'){
		oAuth2Client.setCredentials(code)
		return oAuth2Client
	}
}

async function getClasses(OAuth){
	const classroom = google.classroom({version:'v1',auth: OAuth})
	const classes = (await classroom.courses.list({auth:OAuth},{})).data
	return classes
}

async function getClass(OAuth,cid){
	const classroom = google.classroom({version:'v1',auth: OAuth})
	const clas = (await classroom.courses.get({auth: OAuth,id: cid}))
	return clas
}

async function getAssignments(OAuth,courseID){
	const classroom = google.classroom({version:'v1',auth: OAuth})
	const classes = (await classroom.courses.courseWork.list({courseId: courseID})).data
	return classes
}

async function getEmail(OAuth){
	const classroom = google.classroom({version:'v1',auth: OAuth})
	const out = (await classroom.userProfiles.get({auth:OAuth,userId: 'me'})).data
	return out.emailAddress
}

async function getTeacher(OAuth,cid,uid){
	const classroom = google.classroom({version:'v1',auth: OAuth})
	const out = (await classroom.courses.teachers.get({auth: OAuth,courseId: cid,userId: uid})).data.profile
	return out
}

module.exports={
	authorize: authorize,
	getClasses: getClasses,
	getClass: getClass,
	getAssignments: getAssignments,
	getEmail: getEmail,
	getTeacher: getTeacher,
}

