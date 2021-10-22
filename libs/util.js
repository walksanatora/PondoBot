
//constants
//blank storage file
const blankDB = {
	user: {},
	server: {}
}

//year number to a year
const noToYear ={
	1:'freshman',
	2:'sophmore',
	3:'junior',
	4:'senior'
}
//checks if all values in target are present in arr
let checker = (arr,target) => target.every(v=>arr.includes(v))

//users that are *always* allowed to use authorized commands
const allowedUsers = ['596098777941540883']

//functions
function has(value,array) {
	let hasValue = false
	array.forEach(element => {
		if (element == value){
			hasValue = true
		}
	})
	return hasValue
}

async function authorized(interaction) {
	if (await interaction.member.permissions.has('MANAGE_GUILD')) {return true}
	if (allowedUsers.includes(interaction.member.id)) {return true}
	return false
}

module.exports ={
	has: has,
	blank: blankDB,
	noToYear: noToYear,
	allowedUsers:allowedUsers,
	authorized:authorized,
	checker: checker,

}